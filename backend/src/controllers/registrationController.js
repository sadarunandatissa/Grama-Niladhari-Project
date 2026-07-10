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

// Submit registration with image upload (handled by multer middleware)
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

    // ----- VALIDATION -----
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
    // Phone numbers
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
    // Family head logic
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

    // ----- UNIQUENESS CHECKS -----
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
    // Also check Citizen collection
    const citizenExists = await Citizen.findOne({ $or: [{ email }, { nic }] });
    if (citizenExists) {
      return res
        .status(400)
        .json({ success: false, message: "Email or NIC already verified." });
    }

    // Verify village exists
    const village = await Village.findOne({ village_id });
    if (!village) {
      return res
        .status(404)
        .json({ success: false, message: "Selected village does not exist." });
    }

    // If family member, ensure family_reg_no exists (but we'll verify later during GN verification)
    // For now we just store it.

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

// (GN Officer verification logic – unchanged from previous, but ensure it creates family/head properly)
// We'll reuse the existing verifyRegistration function.
