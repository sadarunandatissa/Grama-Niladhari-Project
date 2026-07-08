const RegistrationRequest = require("../models/RegistrationRequest");
const Citizen = require("../models/Citizen");
const Family = require("../models/Family");
const GNOfficer = require("../models/GNOfficer");
const Village = require("../models/Village");
const AuditLog = require("../models/AuditLog");
const bcrypt = require("bcryptjs");
const { validateRegistrationRequest } = require("../utils/validators");
const { generateFamilyRegNo } = require("../utils/helpers");

/**
 * Submit citizen registration request (with image)
 * POST /api/registration/submit
 */
exports.submitRegistration = async (req, res) => {
  try {
    const data = req.body;

    // --- Validate input ---
    const validation = validateRegistrationRequest(data);
    if (!validation.isValid) {
      return res
        .status(400)
        .json({ success: false, errors: validation.errors });
    }

    // Check if email or NIC already exists
    const existingEmail = await RegistrationRequest.findOne({
      email: data.email,
    });
    if (existingEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered." });
    }
    const existingNIC = await RegistrationRequest.findOne({ nic: data.nic });
    if (existingNIC) {
      return res
        .status(400)
        .json({ success: false, message: "NIC already registered." });
    }
    // Also check in Citizen collection
    const citizenExists = await Citizen.findOne({
      $or: [{ email: data.email }, { nic: data.nic }],
    });
    if (citizenExists) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Email or NIC already registered as citizen.",
        });
    }

    // Verify village exists
    const village = await Village.findOne({ village_id: data.village_id });
    if (!village) {
      return res
        .status(404)
        .json({ success: false, message: "Selected village not found." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password, salt);

    // Get profile picture path from multer
    let profile_picture = null;
    if (req.file) {
      profile_picture = `/uploads/citizens/${req.file.filename}`;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Profile picture is required." });
    }

    // Build registration request
    const registration = new RegistrationRequest({
      email: data.email.toLowerCase().trim(),
      password_hash,
      nic: data.nic.toUpperCase().trim(),
      full_name: data.full_name.trim(),
      initials: data.initials || "",
      surname: data.surname || "",
      first_name: data.first_name || "",
      middle_name: data.middle_name || "",
      last_name: data.last_name || "",
      date_of_birth: new Date(data.date_of_birth),
      gender: data.gender,
      address: data.address.trim(),
      phone_numbers: data.phone_numbers.map((p) => p.trim()),
      occupation: data.occupation || "",
      village_id: data.village_id,
      profile_picture,
      is_family_head: data.is_family_head,
      family_reg_no: data.family_reg_no || null,
      status: "pending",
    });
    await registration.save();

    // Audit log (optional)
    await AuditLog.create({
      user_type: "citizen",
      user_id: registration._id,
      user_model: "RegistrationRequest",
      action: "SUBMIT_REGISTRATION",
      details: { email: data.email, village_id: data.village_id },
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });

    res.status(201).json({
      success: true,
      message: "Registration submitted. Awaiting GN Officer verification.",
      data: { registration_id: registration._id },
    });
  } catch (error) {
    console.error("Submit registration error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * Get pending registrations for GN Officer (with image)
 * GET /api/registration/pending
 */
exports.getPendingRegistrations = async (req, res) => {
  try {
    const officerId = req.user.id;
    const officer = await GNOfficer.findById(officerId);
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "GN Officer not found." });
    }

    const pending = await RegistrationRequest.find({
      status: "pending",
      village_id: officer.village_id,
    }).sort({ created_at: -1 });

    res.json({ success: true, count: pending.length, data: pending });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * Verify or reject registration (GN Officer)
 * PUT /api/registration/verify/:id
 */
exports.verifyRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rejection_reason } = req.body;
    const officerId = req.user.id;

    const registration = await RegistrationRequest.findById(id);
    if (!registration) {
      return res
        .status(404)
        .json({ success: false, message: "Registration not found." });
    }
    if (registration.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: `Already ${registration.status}.` });
    }

    const officer = await GNOfficer.findById(officerId);
    if (!officer || officer.village_id !== registration.village_id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized for this village." });
    }

    if (action === "reject") {
      registration.status = "rejected";
      registration.rejection_reason =
        rejection_reason || "Rejected by GN Officer";
      registration.verified_by = officerId;
      registration.verified_at = new Date();
      await registration.save();
      // audit log
      await AuditLog.create({
        user_type: "gn_officer",
        user_id: officerId,
        user_model: "GNOfficer",
        action: "REJECT_REGISTRATION",
        details: { registration_id: id, reason: rejection_reason },
        ip_address: req.ip,
        user_agent: req.headers["user-agent"],
      });
      return res.json({ success: true, message: "Registration rejected." });
    }

    // --- VERIFY ---
    // Check family_reg_no if not head
    let familyId;
    if (!registration.is_family_head) {
      const family = await Family.findOne({
        family_reg_no: registration.family_reg_no,
        village_id: officer.village_id,
      });
      if (!family) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Family registration number not found.",
          });
      }
      familyId = family._id;
    }

    // Create family for head
    if (registration.is_family_head) {
      const familyRegNo = await generateFamilyRegNo(officer.village_id);
      const newFamily = new Family({
        village_id: officer.village_id,
        family_reg_no: familyRegNo,
        address: registration.address,
        is_verified: true,
        verified_at: new Date(),
        member_count: 1,
      });
      const savedFamily = await newFamily.save();
      familyId = savedFamily._id;
    }

    // Create Citizen
    const newCitizen = new Citizen({
      email: registration.email,
      password_hash: registration.password_hash,
      nic: registration.nic,
      full_name: registration.full_name,
      initials: registration.initials,
      surname: registration.surname,
      first_name: registration.first_name,
      middle_name: registration.middle_name,
      last_name: registration.last_name,
      date_of_birth: registration.date_of_birth,
      gender: registration.gender,
      address: registration.address,
      phone_numbers: registration.phone_numbers,
      occupation: registration.occupation,
      village_id: registration.village_id,
      profile_picture: registration.profile_picture,
      family_id: familyId,
      is_head: registration.is_family_head,
      relationship_to_head: registration.is_family_head ? "Self" : "Other",
      is_verified: true,
      verified_at: new Date(),
      verified_by: officerId,
      is_active: true,
    });
    const citizen = await newCitizen.save();

    // If family head, update family head_citizen_id
    if (registration.is_family_head) {
      await Family.findByIdAndUpdate(familyId, {
        head_citizen_id: citizen._id,
      });
    }

    // Update registration
    registration.status = "verified";
    registration.verified_by = officerId;
    registration.verified_at = new Date();
    registration.citizen_id = citizen._id;
    registration.family_id = familyId;
    await registration.save();

    // Audit log
    await AuditLog.create({
      user_type: "gn_officer",
      user_id: officerId,
      user_model: "GNOfficer",
      action: "VERIFY_REGISTRATION",
      details: { registration_id: id, citizen_id: citizen._id },
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });

    res.json({
      success: true,
      message: "Registration verified successfully.",
      data: { citizen_id: citizen._id, family_id: familyId },
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
