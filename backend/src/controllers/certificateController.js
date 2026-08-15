const Certificate = require("../models/Certificate");
const Citizen = require("../models/Citizen");
const GNOfficer = require("../models/GNOfficer");
const Notification = require("../models/Notification");

// ─── Helpers ──────────────────────────────────────────────

// Auto-fill citizen details
const getCitizenDetails = async (citizenId) => {
  const citizen = await Citizen.findById(citizenId).select(
    "nic first_name middle_name last_name surname address phone_numbers village_id",
  );
  return citizen;
};

// Send SMS placeholder (integrate with SMS gateway)
const sendSMS = async (phone, message) => {
  console.log(`📱 SMS to ${phone}: ${message}`);
  // TODO: Integrate with Twilio or local SMS gateway
};

// ─── Citizen: Request Certificate ─────────────────────────

exports.requestCertificate = async (req, res) => {
  try {
    const { certificateType, formData } = req.body;
    const citizenId = req.user.id;

    // 1. Get citizen details for auto-fill
    const citizen = await Citizen.findById(citizenId);
    if (!citizen) {
      return res
        .status(404)
        .json({ success: false, message: "Citizen not found" });
    }

    // 2. Validate certificate type
    const validTypes = ["residential", "income", "character"];
    if (!validTypes.includes(certificateType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid certificate type" });
    }

    // 3. Validate form data based on type
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

    // 4. Create certificate request
    const certificate = new Certificate({
      citizenId: citizen._id,
      village_id: citizen.village_id,
      certificateType,
      formData: {
        ...formData,
        // Auto-fill fields from citizen
        nic: citizen.nic,
        first_name: citizen.first_name,
        middle_name: citizen.middle_name,
        last_name: citizen.last_name,
        surname: citizen.surname,
        address: citizen.address,
        telephone: citizen.phone_numbers?.[0] || "",
      },
      status: "not_seen",
      requestedAt: new Date(),
    });
    await certificate.save();

    // 5. Notify GN Officer (in-app notification)
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
      data: {
        certificateId: certificate._id,
        status: certificate.status,
      },
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

    // Enrich with officer details if needed
    res.json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    console.error("Get my certificates error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GN Officer: Get Pending Requests ────────────────────

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
      .populate("citizenId", "full_name email nic phone_numbers")
      .sort({ requestedAt: 1 }); // Ascending order (oldest first)

    // Add warning flags
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

    res.json({
      success: true,
      data: enhanced,
    });
  } catch (error) {
    console.error("Get pending certificates error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GN Officer: Update Status ───────────────────────────

exports.updateCertificateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, officerNotes } = req.body;
    const officerId = req.user.id;

    // Validate status
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

    // Verify officer belongs to same village
    const officer = await GNOfficer.findById(officerId);
    if (!officer || officer.village_id !== certificate.village_id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    // Update status
    certificate.status = status;
    certificate.lastStatusChangeAt = new Date();
    if (officerNotes) {
      certificate.officerNotes = officerNotes.trim();
    }
    await certificate.save();

    // ─── Send Notification & SMS to Citizen on Completion ───
    if (status === "completed") {
      const message = `Your ${certificate.certificateType} certificate is ready and you can collect it on office days at the Grama Niladhari Office.`;
      // In-app notification
      await Notification.create({
        recipientId: certificate.citizenId._id,
        recipientModel: "Citizen",
        type: "certificate_ready",
        title: "Certificate Ready",
        message: message,
        link: `/citizen/certificates/${certificate._id}`,
      });
      // SMS
      const phone = certificate.citizenId.phone_numbers?.[0];
      if (phone) {
        await sendSMS(phone, message);
      }
    }

    // ─── Handle Warnings ─────────────────────────────────────
    // If warning condition met, send notification to officer
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

// ─── GN Officer: Get Single Certificate ──────────────────

exports.getCertificateDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findById(id).populate(
      "citizenId",
      "full_name email nic phone_numbers",
    );
    if (!certificate) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found" });
    }
    res.json({ success: true, data: certificate });
  } catch (error) {
    console.error("Get certificate details error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
