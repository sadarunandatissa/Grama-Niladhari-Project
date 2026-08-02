const CertificateRequest = require("../models/CertificateRequest");
const Notification = require("../models/Notification");
const Citizen = require("../models/Citizen");
const GNOfficer = require("../models/GNOfficer");
const path = require("path");
const fs = require("fs");

// ─── FIELD VALIDATION PER CERTIFICATE TYPE ──────────────────
const getRequiredFields = (type) => {
  const fields = {
    residence: ["nic", "fullName", "permanentAddress", "phone", "purpose"],
    family_composition: ["applicantNic", "familyMembers", "address"],
    character: ["nic", "fullName", "address", "occupation", "reason"],
    income: ["nic", "householdIncome", "employmentDetails", "address"],
    school_admission: ["parentNic", "childName", "homeAddress", "schoolName"],
  };
  return fields[type] || [];
};

// ─── SUBMIT CERTIFICATE REQUEST (Citizen) ──────────────────
exports.submitRequest = async (req, res) => {
  try {
    const { certificateType, purpose, formData } = req.body;
    const citizenId = req.user.id;

    // 1. Get citizen to fetch village
    const citizen = await Citizen.findById(citizenId);
    if (!citizen) {
      return res
        .status(404)
        .json({ success: false, message: "Citizen not found" });
    }

    // 2. Validate certificate type
    const validTypes = [
      "residence",
      "family_composition",
      "character",
      "income",
      "school_admission",
    ];
    if (!validTypes.includes(certificateType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid certificate type" });
    }

    // 3. Validate required fields based on type
    const required = getRequiredFields(certificateType);
    const missing = required.filter(
      (field) => !formData[field] || formData[field].trim() === "",
    );
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    // 4. Validate purpose
    if (!purpose || purpose.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Purpose is required (at least 5 characters)",
      });
    }

    // 5. Handle file uploads (if any)
    let documents = [];
    if (req.files && req.files.length > 0) {
      documents = req.files.map(
        (file) => `/uploads/certificates/${file.filename}`,
      );
    }

    // 6. Create certificate request
    const certificateRequest = new CertificateRequest({
      citizenId: citizenId,
      village_id: citizen.village_id,
      certificateType,
      purpose: purpose.trim(),
      formData: formData,
      documents: documents,
      status: "pending",
      trackingId: `${certificateType.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`,
    });

    await certificateRequest.save();

    res.status(201).json({
      success: true,
      message: "Certificate request submitted successfully",
      data: {
        trackingId: certificateRequest.trackingId,
        status: certificateRequest.status,
        requestId: certificateRequest._id,
      },
    });
  } catch (error) {
    console.error("Submit certificate error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GET CITIZEN'S REQUESTS (Citizen) ──────────────────────
exports.getMyRequests = async (req, res) => {
  try {
    const citizenId = req.user.id;
    const requests = await CertificateRequest.find({ citizenId }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Get my requests error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GET PENDING REQUESTS (GN Officer) ──────────────────────
exports.getPendingRequests = async (req, res) => {
  try {
    const officerId = req.user.id;
    const officer = await GNOfficer.findById(officerId);
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });
    }

    const requests = await CertificateRequest.find({
      village_id: officer.village_id,
      status: { $in: ["pending", "processing"] },
    })
      .populate("citizenId", "full_name email nic profile_picture")
      .sort({ requestDate: 1 });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Get pending requests error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GET ALL REQUESTS (GN Officer) ─────────────────────────
exports.getAllRequests = async (req, res) => {
  try {
    const officerId = req.user.id;
    const officer = await GNOfficer.findById(officerId);
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });
    }

    const { status, search } = req.query;
    const filter = { village_id: officer.village_id };

    if (status && status !== "all") {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { trackingId: { $regex: search, $options: "i" } },
        { "formData.fullName": { $regex: search, $options: "i" } },
      ];
    }

    const requests = await CertificateRequest.find(filter)
      .populate("citizenId", "full_name email nic profile_picture")
      .sort({ requestDate: -1 });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Get all requests error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── UPDATE REQUEST STATUS (GN Officer) ────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, officerNotes, generateCertificate } = req.body;
    const officerId = req.user.id;

    // Validate status
    const validStatuses = ["processing", "completed", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed: processing, completed, rejected",
      });
    }

    // Find request
    const request = await CertificateRequest.findById(id).populate(
      "citizenId",
      "full_name email village_id",
    );
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    // Verify officer belongs to same village
    const officer = await GNOfficer.findById(officerId);
    if (!officer || officer.village_id !== request.village_id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized for this village",
      });
    }

    // Update status and dates
    request.status = status;
    if (status === "processing") {
      request.processingDate = new Date();
    }
    if (status === "completed") {
      request.completedDate = new Date();
    }
    if (officerNotes) {
      request.officerNotes = officerNotes.trim();
    }

    // Generate digital certificate (if status is completed and requested)
    let certificateFile = null;
    if (status === "completed" && generateCertificate) {
      // In a real implementation, you would generate a PDF here
      // For now, we create a simple HTML certificate and save it
      const certDir = path.join(__dirname, "../../uploads/certificates");
      if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir, { recursive: true });
      }
      const fileName = `cert_${request.trackingId}_${Date.now()}.html`;
      const filePath = path.join(certDir, fileName);

      // Simple certificate HTML template
      const htmlContent = `
<!DOCTYPE html>
<html>
<head><title>Certificate - ${request.trackingId}</title></head>
<body style="font-family: Arial; text-align: center; padding: 50px; border: 5px solid #2c3e50; border-radius: 10px; max-width: 800px; margin: auto;">
  <h1 style="color: #2c3e50;">CERTIFICATE</h1>
  <h2 style="color: #3498db;">${request.certificateType.toUpperCase().replace("_", " ")}</h2>
  <p style="font-size: 18px;">This is to certify that</p>
  <h3 style="font-size: 24px;">${request.formData.fullName || request.formData.applicantNic || "Citizen"}</h3>
  <p style="font-size: 16px;">Tracking ID: <strong>${request.trackingId}</strong></p>
  <p style="font-size: 16px;">Issued on: ${new Date().toLocaleDateString()}</p>
  <p style="font-size: 16px;">GN Officer: ${officer.full_name}</p>
  <p style="font-size: 16px;">Village: ${request.village_id}</p>
  <hr>
  <p style="color: #7f8c8d;">This is a digitally generated certificate. For verification, please contact the GN office.</p>
</body>
</html>`;
      fs.writeFileSync(filePath, htmlContent);
      certificateFile = `/uploads/certificates/${fileName}`;
      request.certificateFile = certificateFile;
    }

    await request.save();

    // ─── SEND NOTIFICATION TO CITIZEN ────────────────────────
    let notificationMessage = "";
    if (status === "completed") {
      notificationMessage = `Your ${request.certificateType} certificate (${request.trackingId}) is ready. Please visit the GN office to collect it. Date and time: ${new Date().toLocaleDateString()} (during office hours).`;
    } else if (status === "rejected") {
      notificationMessage = `Your ${request.certificateType} certificate request (${request.trackingId}) has been rejected. Reason: ${officerNotes || "Please contact the GN office for more details."}`;
    } else if (status === "processing") {
      notificationMessage = `Your certificate request (${request.trackingId}) is now being processed.`;
    }

    if (notificationMessage) {
      const notification = new Notification({
        recipientId: request.citizenId._id,
        type:
          status === "completed"
            ? "certificate_ready"
            : status === "rejected"
              ? "certificate_rejected"
              : "processing",
        title: `Certificate ${status}`,
        message: notificationMessage,
        link: `/citizen/certificates/${request._id}`,
      });
      await notification.save();

      // TODO: Send SMS (you can integrate Twilio or a local SMS gateway)
      // console.log(`SMS to ${request.citizenId.phone}: ${notificationMessage}`);
    }

    res.json({
      success: true,
      message: `Certificate request ${status}`,
      data: {
        request,
        certificateFile,
      },
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GET A SINGLE REQUEST (Citizen or Officer) ─────────────
exports.getRequestDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await CertificateRequest.findById(id).populate(
      "citizenId",
      "full_name email nic phone profile_picture",
    );

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    // Check if user is authorized (citizen who made it OR officer of the village)
    const user = req.user;
    const isCitizen =
      user.role === "citizen" && request.citizenId._id.toString() === user.id;
    const isOfficer = user.role === "gn_officer";

    if (!isCitizen && !isOfficer) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // For officer, verify village
    if (isOfficer) {
      const officer = await GNOfficer.findById(user.id);
      if (!officer || officer.village_id !== request.village_id) {
        return res
          .status(403)
          .json({ success: false, message: "Not authorized" });
      }
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Get request details error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GET NOTIFICATIONS (Citizen) ──────────────────────────
exports.getNotifications = async (req, res) => {
  try {
    const citizenId = req.user.id;
    const notifications = await Notification.find({
      recipientId: citizenId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── MARK NOTIFICATION AS READ ──────────────────────────────
exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      _id: id,
      recipientId: req.user.id,
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
