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

exports.submitRegistration = async (req, res) => {
  try {
    console.log("📥 Received body:", req.body);
    console.log("📥 family_reg_no raw:", req.body.family_reg_no);

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
      password,
    } = req.body;

    // ✅ Convert is_family_head to boolean
    const isHead = is_family_head === "true" || is_family_head === true;

    // ✅ Explicitly capture family_reg_no from the request body
    const familyRegNo = req.body.family_reg_no || null;

    console.log("✅ isHead:", isHead);
    console.log("✅ familyRegNo captured:", familyRegNo);

    // ---- Validation ----
    if (!validateEmail(email))
      return res.status(400).json({ success: false, message: "Invalid email" });
    if (!validateNIC(nic))
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid NIC (use 9 digits+V or 12 digits)",
        });
    if (!validatePassword(password))
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be 8+ chars with letter and number",
        });
    if (!full_name || full_name.length < 2)
      return res
        .status(400)
        .json({ success: false, message: "Full name required" });
    if (!validateDateOfBirth(date_of_birth))
      return res
        .status(400)
        .json({ success: false, message: "Invalid date of birth" });
    if (!address || address.length < 5)
      return res
        .status(400)
        .json({ success: false, message: "Address required" });
    if (!village_id)
      return res
        .status(400)
        .json({ success: false, message: "Village selection required" });
    if (!phone_numbers || phone_numbers.length === 0)
      return res
        .status(400)
        .json({
          success: false,
          message: "At least one phone number required",
        });
    for (const p of phone_numbers) {
      if (!validatePhone(p))
        return res
          .status(400)
          .json({
            success: false,
            message: `Invalid phone: ${p} (must be 10 digits)`,
          });
    }

    // ✅ Critical: family member must have a number (using isHead)
    if (!isHead && !familyRegNo) {
      return res.status(400).json({
        success: false,
        message: "Family registration number required for non‑head",
      });
    }

    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "Profile picture required" });

    // ---- Uniqueness ----
    if (await RegistrationRequest.findOne({ email }))
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    if (await RegistrationRequest.findOne({ nic }))
      return res
        .status(400)
        .json({ success: false, message: "NIC already registered" });
    if (await Citizen.findOne({ $or: [{ email }, { nic }] }))
      return res
        .status(400)
        .json({ success: false, message: "Email or NIC already verified" });

    const village = await Village.findOne({ village_id });
    if (!village)
      return res
        .status(404)
        .json({ success: false, message: "Village not found" });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const profile_picture = `/uploads/citizens/${req.file.filename}`;

    // ✅ Create registration with the captured familyRegNo and isHead
    const registration = new RegistrationRequest({
      email,
      nic,
      surname,
      initials,
      first_name,
      middle_name,
      last_name,
      full_name,
      date_of_birth: new Date(date_of_birth),
      address,
      village_id,
      phone_numbers,
      occupation,
      profile_picture,
      is_family_head: isHead, // ✅ store as boolean
      family_reg_no: isHead ? null : familyRegNo, // ✅ use isHead
      password_hash,
      status: "pending",
    });

    console.log("📤 Registration object being saved:", registration);
    await registration.save();

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
    console.error("Submit error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getPendingRegistrations = async (req, res) => {
  try {
    const officer = await GNOfficer.findById(req.user.id);
    if (!officer)
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });
    const pending = await RegistrationRequest.find({
      status: "pending",
      village_id: officer.village_id,
    }).sort({ created_at: -1 });
    res.json({ success: true, count: pending.length, data: pending });
  } catch (error) {
    console.error("Get pending error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.verifyRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rejection_reason } = req.body;
    const officerId = req.user.id;

    console.log("📥 Verification start for:", id);

    const registration = await RegistrationRequest.findById(id);
    if (!registration) {
      return res
        .status(404)
        .json({ success: false, message: "Registration not found" });
    }
    if (registration.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: `Already ${registration.status}` });
    }

    const officer = await GNOfficer.findById(officerId);
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });
    }
    const regVillage = Array.isArray(registration.village_id)
      ? registration.village_id[0]
      : registration.village_id;
    if (officer.village_id !== regVillage) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized for this village" });
    }

    // ---- REJECT ----
    if (action === "reject") {
      registration.status = "rejected";
      registration.rejection_reason =
        rejection_reason || "Rejected by GN Officer";
      registration.verified_by = officerId;
      registration.verified_at = new Date();
      await registration.save();
      // Audit – wrap in try‑catch
      try {
        await AuditLog.create({
          user_type: "gn_officer",
          user_id: officerId,
          user_model: "GNOfficer", // ← added user_model
          action: "REJECT_REGISTRATION",
          details: { registration_id: id },
          ip_address: req.ip,
          user_agent: req.headers["user-agent"],
        });
      } catch (auditErr) {
        console.error("Audit log failed (reject):", auditErr.message);
      }
      return res.json({ success: true, message: "Registration rejected" });
    }

    // ---- VERIFY ----
    let familyId;
    if (!registration.is_family_head) {
      if (!registration.family_reg_no) {
        return res
          .status(400)
          .json({ success: false, message: "Family reg number missing" });
      }
      console.log(
        "🔍 Searching family for reg_no:",
        registration.family_reg_no,
      );
      const family = await Family.findOne({
        family_reg_no: registration.family_reg_no,
        village_id: officer.village_id,
      });
      if (!family) {
        return res.status(400).json({
          success: false,
          message: "Family not found in this village",
        });
      }
      familyId = family._id;
    } else {
      console.log(
        "🏷️ Generating new family number for village:",
        officer.village_id,
      );
      const familyRegNo = await generateFamilyRegNo(officer.village_id);
      console.log("✅ Generated family reg no:", familyRegNo);
      const newFamily = new Family({
        village_id: officer.village_id,
        family_reg_no: familyRegNo,
        head_citizen_id: null,
        members: [],
      });
      const saved = await newFamily.save();
      familyId = saved._id;
      console.log("✅ Family saved with ID:", familyId);
    }

    console.log("👤 Creating citizen...");
    const citizen = new Citizen({
      email: registration.email,
      password_hash: registration.password_hash,
      nic: registration.nic,
      full_name: registration.full_name,
      initials: registration.initials || "",
      surname: registration.surname || "",
      first_name: registration.first_name || "",
      middle_name: registration.middle_name || "",
      last_name: registration.last_name || "",
      date_of_birth: registration.date_of_birth,
      address: registration.address,
      phone_numbers: registration.phone_numbers,
      occupation: registration.occupation || "",
      village_id: officer.village_id,
      profile_picture: registration.profile_picture,
      family_id: familyId,
      is_head: registration.is_family_head,
      is_verified: true,
      verified_at: new Date(),
      verified_by: officerId,
      is_active: true,
    });
    await citizen.save();
    console.log("✅ Citizen saved with ID:", citizen._id);

    console.log("🔄 Updating family with head/member...");
    if (registration.is_family_head) {
      await Family.findByIdAndUpdate(familyId, {
        head_citizen_id: citizen._id,
        $push: { members: citizen._id },
      });
    } else {
      await Family.findByIdAndUpdate(familyId, {
        $push: { members: citizen._id },
      });
    }

    registration.status = "verified";
    registration.verified_by = officerId;
    registration.verified_at = new Date();
    registration.citizen_id = citizen._id;
    registration.family_id = familyId;
    await registration.save();

    // Audit – wrap in try‑catch
    try {
      await AuditLog.create({
        user_type: "gn_officer",
        user_id: officerId,
        user_model: "GNOfficer", // ← added user_model
        action: "VERIFY_REGISTRATION",
        details: { registration_id: id, citizen_id: citizen._id },
        ip_address: req.ip,
        user_agent: req.headers["user-agent"],
      });
    } catch (auditErr) {
      console.error("Audit log failed (verify):", auditErr.message);
    }

    res.json({
      success: true,
      message: "Registration verified",
      data: { citizen_id: citizen._id, family_id: familyId },
    });
  } catch (error) {
    console.error("❌ Verification error details:", error.stack);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
