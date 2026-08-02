const CertificateRequest = require("../models/CertificateRequest");
const Notification = require("../models/Notification");
const Citizen = require("../models/Citizen");
const GNOfficer = require("../models/GNOfficer");
const path = require("path");
const fs = require("fs");

//Filed Validation per Certificate Type
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

// Submit Certificate Requestes
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
    // 3. Validate required fields based on types
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
    // 4. Validate  purpose for residence certificate
    if (!purpose || purpose.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Purpose is required (at least 5 charafters)",
      });
    }
    // 5. Handle file upload (if any)
    let documents = [];
    if (req.files && req.files.length > 0) {
      documents = req.files.map(
        (file) => `/uploads/certificates/${file.filename}`,
      );
    }
    // 6. Create certificzte request
    const certificateReqest = new CertificateRequest({
      citizenId: citizenId,
      village_Id: citizen.village_id,
      certificateType,
      purpose: purpose.trim(),
      formData: formData,
      documents: documents,
      status: "pending",
      trackingId: `${certificateType.substring(0, 3).toUpperCase()}-${(Date, now().toString().slice(-6))}-${Math.floor(1000 + Math.random() * 9000)}`,
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
    console.error("Submit certificate error: ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get Certificate Requests from  Citizen
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
    console.error("Get my request error: ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get Pending Request GN Officer
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
      village_Id: officer.village_id,
      status: { $in: ["pending", "processing"] },
    })
      .populate("citizenId", "full_name nic profile_picture")
      .sort({ requestData: 1 });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Get pending requests error: ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all request - GN Officer
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
    const filter = { village_Id: officer.village_id };
    if (status && status !== "all") {
      filter.status = status;
    }
    if (search) {
      filter.$or = [{ trackingId: { $regex: search, $options: "i" } }];
    }
    const requests = await CertificateRequest.find(filter)
      .populate("citizenId", "full_name nic profile_picture")
      .sort({ requestData: -1 });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Get all request error: ", error);
    res.status(500).json({ success: false, message: " Server error" });
  }
};


// Update Request Status - GN Officer
exports.updateStatus = async (req, res) =>{
    try {
        const { id } = req.params;
        const {status, officerNotes, generateCertificate} = req.body;
        const officerId = req.user.id;

        //Validate status
        const validStatuses = ['processing', 'completed', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false, message: 'Invalid status. Allowd: processing, completed, rejected'
            });
        }
        // Find Request
        const request = await CertificateRequest.findById(id).poppulate('citizenId', 'full_name email village_id');
        if (!request) {
            return res.status(404).json({success: false, message: 'Request not found'});
        }
        //Verify officer belongs to same village
        const officer = await GNOfficer.findById(officerId);
        if (!officer || officer.village_id !== request.village_Id) {
            return res.status(403).json({
                success: false, message: 'Not authorized for this village'
            });
        }
    }
}