const Certificate = require("../models/Certificate");
const Citizen = require("../models/Citizen");
const GNOfficer = require("../models/GNOfficer");
const Notification = require("../models/Notification");

// ─── Helpers ──────────────────────────────────────────────

const sendSMS = async (phone, message) => {
  console.log(`📱 SMS to ${phone}: ${message}`);
  // TODO: integrate Twilio
};

// ─── Citizen: Request Certificate (with file upload) ──────

exports.requestCertificate = async (req, res) => {
  try {
    const { certificateType, formData } = req.body;
    const citizenId = req.user.id;

    const citizen = await Citizen.findById(citizenId);
    if (!citizen) {
      return res
        .status(404)
        .json({ success: false, message: "Citizen not found" });
    }

    // Validate type
    const validTypes = ["residential", "income", "character"];
    if (!validTypes.includes(certificateType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid certificate type" });
    }

    // Validate required fields
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
    const autoData = {
      nic: citizen.nic,
      first_name: citizen.first_name,
      middle_name: citizen.middle_name,
      last_name: citizen.last_name,
      surname: citizen.surname,
    };
    // Merge: user can override address/telephone
    const finalFormData = {
      ...autoData,
      address: formData.address || citizen.address,
      telephone: formData.telephone || citizen.phone_numbers?.[0] || "",
      reason: formData.reason,
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

    // Notify GN Officer (in-app)
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

// ─── GN Officer: Update Status ────────────────────────────

exports.updateCertificateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, officerNotes } = req.body;
    const officerId = req.user.id;

    if (!["not_seen", "in_progress", "completed"].includes(status)) {
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

    certificate.status = status;
    certificate.lastStatusChangeAt = new Date();
    if (officerNotes) {
      certificate.officerNotes = officerNotes.trim();
    }
    await certificate.save();

    // Send notification to citizen on completion
    if (status === "completed") {
      const message = `Your ${certificate.certificateType} certificate is ready and you can collect it on office days at the Grama Niladhari Office.`;
      await Notification.create({
        recipientId: certificate.citizenId._id,
        recipientModel: "Citizen",
        type: "certificate_ready",
        title: "Certificate Ready",
        message: message,
        link: `/citizen/certificates/${certificate._id}`,
      });
      const phone = certificate.citizenId.phone_numbers?.[0];
      if (phone) await sendSMS(phone, message);
    }

    // Warning notifications
    const now = new Date();
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let warningMessage = "";
    if (
      certificate.status === "not_seen" &&
      certificate.requestedAt < twoDaysAgo &&
      !certificate.warningSent
    ) {
      warningMessage = `Certificate request (${certificate._id}) has not been seen for more than 2 days.`;
    } else if (
      certificate.status === "in_progress" &&
      certificate.lastStatusChangeAt < sevenDaysAgo &&
      !certificate.warningSent
    ) {
      warningMessage = `Certificate request (${certificate._id}) has been 'In Progress' for more than 7 days.`;
    }
    if (warningMessage) {
      await Notification.create({
        recipientId: officerId,
        recipientModel: "GNOfficer",
        type: "warning",
        title: "⚠️ Certificate Warning",
        message: warningMessage,
        link: `/officer/certificates/${certificate._id}`,
      });
      certificate.warningSent = true;
      await certificate.save();
    }

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
