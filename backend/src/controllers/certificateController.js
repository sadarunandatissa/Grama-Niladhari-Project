const Certificate = require("../models/Certificate");
const Citizen = require("../models/Citizen");
const GNOfficer = require("../models/GNOfficer");
const Notification = require("../models/Notification");
const Land = require("../models/Land");

// ─── Helpers ──────────────────────────────────────────────

const sendSMS = async (phone, message) => {
  console.log(`📱 SMS to ${phone}: ${message}`);
  // TODO: integrate Twilio
};

exports.getCertificateDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findById(id).populate(
      "citizenId",
      "full_name email nic phone_numbers profile_picture address village_id",
    );

    if (!certificate) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found" });
    }

    const officerId = req.user.id;
    const officer = await GNOfficer.findById(officerId);
    if (!officer || officer.village_id !== certificate.village_id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    // Prepare response object
    const response = {
      ...certificate.toObject(),
      citizen: certificate.citizenId,
    };

    // For residential certificate, fetch land by survey number
    if (certificate.certificateType === "residential") {
      const surveyNumber = certificate.formData.survey_number;
      if (surveyNumber) {
        const land = await Land.findOne({
          survey_number: surveyNumber,
          village_id: officer.village_id,
          is_active: true,
        });
        response.landDetails = land || null;
      }
    }

    // For income certificate, fetch all lands of the citizen
    if (certificate.certificateType === "income") {
      const citizenNIC = certificate.citizenId.nic;
      const lands = await Land.find({
        owner_nic: citizenNIC,
        village_id: officer.village_id,
        is_active: true,
      });
      response.lands = lands;
    }

    res.json({ success: true, data: response });
  } catch (error) {
    console.error("Get certificate details error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
  res.json({ success: true, data: certificate });
};

// ─── Citizen: Request Certificate (with file upload) ──────

exports.requestCertificate = async (req, res) => {
  try {
    const { certificateType } = req.body;

    // ✅ Parse formData from JSON string (sent by frontend)
    let formData = {};
    if (req.body.formData) {
      try {
        formData =
          typeof req.body.formData === "string"
            ? JSON.parse(req.body.formData)
            : req.body.formData;
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: "Invalid form data format.",
        });
      }
    }

    // Get citizen
    const citizen = await Citizen.findById(req.user.id);
    if (!citizen) {
      return res
        .status(404)
        .json({ success: false, message: "Citizen not found" });
    }

    // Validate certificate type
    const validTypes = ["residential", "income", "character"];
    if (!validTypes.includes(certificateType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid certificate type" });
    }

    // ✅ Validate required fields using the parsed formData
    const requiredFields = {
      residential: ["reason", "survey_number"],
      income: ["anual_income", "reason"],
      character: ["reason"],
    };
    const required = requiredFields[certificateType] || [];
    const missing = required.filter(
      (field) => !formData[field] || formData[field].trim() === "",
    );
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    // Auto-fill from citizen but allow user to override address/phone
    const finalFormData = {
      nic: citizen.nic,
      first_name: citizen.first_name,
      middle_name: citizen.middle_name,
      last_name: citizen.last_name,
      surname: citizen.surname,
      address: formData.address || citizen.address,
      telephone: formData.telephone || citizen.phone_numbers?.[0] || "",
      reason: formData.reason || "",
      survey_number: formData.survey_number || "",
      anual_income: formData.anual_income || "",
    };

    // Save uploaded files
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(
        (file) => `/uploads/certificates/${file.filename}`,
      );
    }

    const certificate = new Certificate({
      citizenId: citizen._id,
      village_id: citizen.village_id,
      certificateType,
      formData: finalFormData,
      attachments,
      status: "not_seen",
      requestedAt: new Date(),
    });
    await certificate.save();

    // Notify GN Officer
    const officer = await GNOfficer.findOne({ village_id: citizen.village_id });
    if (officer) {
      await Notification.create({
        recipientId: officer._id,
        recipientModel: "GNOfficer",
        type: "certificate_request",
        title: "New Certificate Request",
        message: `Citizen ${citizen.full_name} requested a ${certificateType} certificate.`,
        link: `/officer/certificates/${certificate._id}`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Certificate request submitted successfully",
      data: { certificateId: certificate._id, status: certificate.status },
    });
  } catch (error) {
    console.error("Request certificate error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Citizen: Get My Requests ────────────────────────────

exports.getMyCertificates = async (req, res) => {
  try {
    const citizenId = req.user.id;
    const certificates = await Certificate.find({ citizenId }).sort({
      requestedAt: -1,
    });
    res.json({ success: true, data: certificates });
  } catch (error) {
    console.error("Get my certificates error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Citizen: Get Notifications ──────────────────────────

exports.getCitizenNotifications = async (req, res) => {
  try {
    const citizenId = req.user.id;
    const notifications = await Notification.find({
      recipientId: citizenId,
      recipientModel: "Citizen",
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Get Notifications for GN Officer ──────────────────────
exports.getOfficerNotifications = async (req, res) => {
  try {
    const officerId = req.user.id;
    const notifications = await Notification.find({
      recipientId: officerId,
      recipientModel: "GNOfficer", // ← must match the model's enum
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error("Get officer notifications error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
  console.log("🔍 getOfficerNotifications called for user:", req.user.id);
};

// ─── Citizen: Mark Notification as Read ──────────────────

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      _id: id,
      recipientId: req.user.id,
      recipientModel: "Citizen",
    });
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }
    notification.isRead = true;
    await notification.save();
    res.json({ success: true, message: "Marked as read" });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GN Officer: Get Pending Certificates ─────────────────

exports.getPendingCertificates = async (req, res) => {
  try {
    const officerId = req.user.id;
    const officer = await GNOfficer.findById(officerId);
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });
    }

    const certificates = await Certificate.find({
      village_id: officer.village_id,
    })
      .populate(
        "citizenId",
        "full_name email nic phone_numbers profile_picture",
      )
      .sort({ requestedAt: 1 });

    const now = new Date();
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const enhanced = certificates.map((cert) => {
      const isNotSeenWarning =
        cert.status === "not_seen" &&
        cert.requestedAt < twoDaysAgo &&
        !cert.warningSent;
      const isInProgressWarning =
        cert.status === "in_progress" &&
        cert.lastStatusChangeAt < sevenDaysAgo &&
        !cert.warningSent;
      return {
        ...cert.toObject(),
        warning: isNotSeenWarning || isInProgressWarning,
      };
    });

    res.json({ success: true, data: enhanced });
  } catch (error) {
    console.error("Get pending certificates error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GN Officer: Get Certificate Details ──────────────────

exports.getCertificateDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findById(id).populate(
      "citizenId",
      "full_name email nic phone_numbers profile_picture address village_id",
    );
    if (!certificate) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found" });
    }

    // Verify officer belongs to same village
    const officerId = req.user.id;
    const officer = await GNOfficer.findById(officerId);
    if (!officer || officer.village_id !== certificate.village_id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    res.json({ success: true, data: certificate });
  } catch (error) {
    console.error("Get certificate details error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Citizen: Get Single Certificate Details ──────────────
exports.getCitizenCertificateDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const citizenId = req.user.id;

    const certificate = await Certificate.findById(id).populate(
      "citizenId",
      "full_name email nic phone_numbers profile_picture address",
    );

    if (!certificate) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found" });
    }

    // Verify citizen owns the certificate
    if (certificate.citizenId._id.toString() !== citizenId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    res.json({ success: true, data: certificate });
  } catch (error) {
    console.error("Get citizen certificate details error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GN Officer: Update Status ────────────────────────────

exports.updateCertificateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, officerNotes, rejectionReason } = req.body;
    const officerId = req.user.id;

    // Validate status
    const validStatuses = ["not_seen", "in_progress", "completed", "rejected"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const certificate = await Certificate.findById(id).populate(
      "citizenId",
      "full_name email phone_numbers",
    );
    if (!certificate) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found" });
    }

    const officer = await GNOfficer.findById(officerId);
    if (!officer || officer.village_id !== certificate.village_id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    // Update fields
    certificate.status = status;
    certificate.lastStatusChangeAt = new Date();
    if (officerNotes) {
      certificate.officerNotes = officerNotes.trim();
    }
    if (status === "rejected") {
      certificate.rejectionReason = rejectionReason || "No reason provided";
    }

    await certificate.save();

    // ─── Send notification to citizen ──────────────────────
    let notificationMessage = "";
    let notificationType = "";
    let smsMessage = "";

    if (status === "completed") {
      notificationMessage = `Your ${certificate.certificateType} certificate is ready. Collect it at the GN office.`;
      notificationType = "certificate_ready";
    } else if (status === "rejected") {
      notificationMessage = `Your ${certificate.certificateType} certificate request was rejected. Reason: ${certificate.rejectionReason}`;
      notificationType = "certificate_rejected";
    } else if (status === "in_progress") {
      notificationMessage = `Your ${certificate.certificateType} certificate is being processed.`;
      notificationType = "processing";
    }

    if (notificationMessage) {
      await Notification.create({
        recipientId: certificate.citizenId._id,
        recipientModel: "Citizen",
        type: notificationType,
        title:
          status === "rejected"
            ? "Certificate Rejected"
            : `Certificate ${status}`,
        message: notificationMessage,
        link: `/citizen/certificates/${certificate._id}`,
      });
      // Send SMS
      const phone = certificate.citizenId.phone_numbers?.[0];
      if (phone) {
        await sendSMS(phone, notificationMessage);
      }
    }

    // ─── Warning notifications (unchanged) ──────────────────
    // (keep existing warning logic)

    res.json({
      success: true,
      message: `Certificate status updated to ${status}`,
      data: certificate,
    });
  } catch (error) {
    console.error("Update certificate status error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
