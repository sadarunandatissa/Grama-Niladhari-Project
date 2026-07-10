const RegistrationRequest = require("../models/RegistrationRequest");
const Citizen = require("../models/Citizen");
const Family = require("../models/Family");
const GNOfficer = require("../models/GNOfficer");
const Village = require("../models/Village");
const AuditLog = require("../models/AuditLog");
const bcrypt = require("bcryptjs");
const {
  validateNIC,
  validatePhone,
  validateEmail,
  validatePassword,
  validateDateOfBirth,
} = require("../utils/validators");
const { generateFamilyRegNo } = require("../utils/helpers");

// ─── SUBMIT REGISTRATION (Citizen) ──────────────────────────────────────────
exports.submitRegistration = async (req, res) => {
  try {
    const {
      email,
      nic,
      surname,
      initials,
      first_name,
      middle_name,
      last_name,
      full_name,
      date_of_birth,
      address,
      village_id,
      phone_numbers,
      occupation,
      is_family_head,
      family_reg_no,
      password,
    } = req.body;

    // Validation (all checks)
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format." });
    }
    if (!validateNIC(nic)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid NIC format. Use 9 digits + V or 12 digits.",
        });
    }
    if (!validatePassword(password)) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Password must be at least 8 characters with a letter and number.",
        });
    }
    if (!full_name || full_name.trim().length < 2) {
      return res
        .status(400)
        .json({ success: false, message: "Full name is required." });
    }
    if (!validateDateOfBirth(date_of_birth)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid date of birth." });
    }
    if (!address || address.trim().length < 5) {
      return res
        .status(400)
        .json({ success: false, message: "Address is required." });
    }
    if (!village_id) {
      return res
        .status(400)
        .json({ success: false, message: "Village selection is required." });
    }
    if (!phone_numbers || phone_numbers.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "At least one phone number required.",
        });
    }
    for (const p of phone_numbers) {
      if (!validatePhone(p)) {
        return res
          .status(400)
          .json({
            success: false,
            message: `Phone number ${p} is invalid (must be 10 digits).`,
          });
      }
    }
    if (is_family_head === false && !family_reg_no) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Family registration number required for non‑head members.",
        });
    }
    // Profile picture required
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Profile picture is required." });
    }
    const profile_picture = `/uploads/citizens/${req.file.filename}`;

    // Uniqueness checks
    const existingEmail = await RegistrationRequest.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered." });
    }
    const existingNIC = await RegistrationRequest.findOne({ nic });
    if (existingNIC) {
      return res
        .status(400)
        .json({ success: false, message: "NIC already registered." });
    }
    const citizenExists = await Citizen.findOne({ $or: [{ email }, { nic }] });
    if (citizenExists) {
      return res
        .status(400)
        .json({ success: false, message: "Email or NIC already verified." });
    }

    // Village exists?
    const village = await Village.findOne({ village_id });
    if (!village) {
      return res
        .status(404)
        .json({ success: false, message: "Selected village does not exist." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create registration request
    const registration = new RegistrationRequest({
      email,
      nic,
      surname: surname || "",
      initials: initials || "",
      first_name: first_name || "",
      middle_name: middle_name || "",
      last_name: last_name || "",
      full_name: full_name.trim(),
      date_of_birth: new Date(date_of_birth),
      address: address.trim(),
      village_id,
      phone_numbers,
      occupation: occupation || "",
      profile_picture,
      is_family_head,
      family_reg_no: is_family_head ? null : family_reg_no,
      password_hash,
      status: "pending",
    });
    await registration.save();

    // Optional audit log
    try {
      await AuditLog.create({
        user_type: "citizen",
        user_id: registration._id,
        user_model: "RegistrationRequest",
        action: "SUBMIT_REGISTRATION",
        details: { email, village_id },
        ip_address: req.ip,
        user_agent: req.headers["user-agent"],
      });
    } catch (e) {}

    res.status(201).json({
      success: true,
      message: "Registration submitted. Awaiting GN officer verification.",
      data: { registration_id: registration._id },
    });
  } catch (error) {
    console.error("Submit registration error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── GET PENDING REGISTRATIONS (GN Officer) ─────────────────────────────────
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
    console.error("Get pending error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── VERIFY REGISTRATION (GN Officer) ───────────────────────────────────────
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

    // ---- REJECT ----
    if (action === "reject") {
      registration.status = "rejected";
      registration.rejection_reason =
        rejection_reason || "Rejected by GN Officer";
      registration.verified_by = officerId;
      registration.verified_at = new Date();
      await registration.save();
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

    // ---- VERIFY ----
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
        head_citizen_id: null, // will update later
        members: [],
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
      address: registration.address,
      phone_numbers: registration.phone_numbers,
      occupation: registration.occupation,
      village_id: registration.village_id,
      profile_picture: registration.profile_picture,
      family_id: familyId,
      is_head: registration.is_family_head,
      is_verified: true,
      verified_at: new Date(),
      verified_by: officerId,
      is_active: true,
    });
    const citizen = await newCitizen.save();

    // If family head, update family head_citizen_id and add to members
    if (registration.is_family_head) {
      await Family.findByIdAndUpdate(familyId, {
        head_citizen_id: citizen._id,
        $push: { members: citizen._id },
      });
    } else {
      // Add member to existing family
      await Family.findByIdAndUpdate(familyId, {
        $push: { members: citizen._id },
      });
    }

    // Update registration
    registration.status = "verified";
    registration.verified_by = officerId;
    registration.verified_at = new Date();
    registration.citizen_id = citizen._id;
    registration.family_id = familyId;
    await registration.save();

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
