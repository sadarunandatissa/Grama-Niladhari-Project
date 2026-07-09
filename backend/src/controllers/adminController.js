const GNOfficer = require("../models/GNOfficer");
const Village = require("../models/Village");
const Citizen = require("../models/Citizen");
const RegistrationRequest = require("../models/RegistrationRequest");
const AuditLog = require("../models/AuditLog");
const bcrypt = require("bcryptjs");
const {
  validateEmail,
  validatePassword,
  validatePhone,
} = require("../utils/validators");

// ─── STATS ────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const totalVillages = await Village.countDocuments();
    const totalOfficers = await GNOfficer.countDocuments();
    const totalCitizens = await Citizen.countDocuments();
    const pendingRegistrations = await RegistrationRequest.countDocuments({
      status: "pending",
    });
    const totalRegistrations = await RegistrationRequest.countDocuments();

    res.json({
      success: true,
      data: {
        totalVillages,
        totalOfficers,
        totalCitizens,
        pendingRegistrations,
        totalRegistrations,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── GET VILLAGES ──────────────────────────────────────────
exports.getVillages = async (req, res) => {
  try {
    const villages = await Village.find().select("village_id name").lean();
    res.json({ success: true, data: villages });
  } catch (error) {
    console.error("Get villages error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── GET ALL GN OFFICERS ──────────────────────────────────
exports.getAllGNOfficers = async (req, res) => {
  try {
    const officers = await GNOfficer.find()
      .populate({
        path: "village_id",
        model: "Village",
        select: "name village_id",
        foreignField: "village_id",
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: officers });
  } catch (error) {
    console.error("Get officers error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── CREATE GN OFFICER ────────────────────────────────────
// ✅ THIS FUNCTION CREATES A GNOfficer, NOT A Village
exports.createGNOfficer = async (req, res) => {
  console.log("createGNOfficer called - Creating a GNOfficer, NOT a Village");
  try {
    const { email, password, full_name, phone, village_id } = req.body;

    // Validate
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format." });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({
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
    if (!validatePhone(phone)) {
      return res
        .status(400)
        .json({ success: false, message: "Phone must be exactly 10 digits." });
    }

    // Fix village_id if it's an array
    let villageIdString = village_id;
    if (Array.isArray(village_id)) {
      villageIdString = village_id.find((v) => v) || village_id[0];
    }
    if (!villageIdString) {
      return res
        .status(400)
        .json({ success: false, message: "Village selection is required." });
    }

    // Check village exists
    const village = await Village.findOne({ village_id: villageIdString });
    if (!village) {
      return res
        .status(404)
        .json({ success: false, message: "Village not found." });
    }

    // Check email
    const existing = await GNOfficer.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already registered as GN Officer.",
      });
    }

    // Check existing officer in village
    const existingOfficer = await GNOfficer.findOne({
      village_id: villageIdString,
      is_active: true,
    });
    if (existingOfficer) {
      return res.status(400).json({
        success: false,
        message: `This village already has an active GN Officer: ${existingOfficer.full_name} (${existingOfficer.email})`,
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Profile picture
    let profile_picture = null;
    if (req.file) {
      profile_picture = `/uploads/gn_officers/${req.file.filename}`;
    }

    // ✅ ✅ ✅ CREATE GN OFFICER (NOT VILLAGE) ✅ ✅ ✅
    const gnOfficer = new GNOfficer({
      email: email.trim().toLowerCase(),
      password_hash,
      full_name: full_name.trim(),
      phone: phone.trim(),
      village_id: villageIdString,
      profile_picture,
      created_by: req.user.id,
      is_active: true,
    });
    await gnOfficer.save();

    // Audit log
    try {
      await AuditLog.create({
        user_type: "admin",
        user_id: req.user.id,
        user_model: "Admin",
        action: "CREATE_GN_OFFICER",
        details: { email, village_id: villageIdString, full_name },
        ip_address: req.ip,
        user_agent: req.headers["user-agent"],
      });
    } catch (auditErr) {
      console.warn("Audit log failed:", auditErr.message);
    }

    res.status(201).json({
      success: true,
      message: "GN Officer created successfully.",
      data: {
        id: gnOfficer._id,
        email,
        full_name,
        village_id: villageIdString,
      },
    });
  } catch (error) {
    console.error("❌ Create GN Officer error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

// ─── DELETE GN OFFICER ─────────────────────────────────────
exports.deleteGNOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const officer = await GNOfficer.findByIdAndDelete(id);
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "GN Officer not found." });
    }
    try {
      await AuditLog.create({
        user_type: "admin",
        user_id: req.user.id,
        user_model: "Admin",
        action: "DELETE_GN_OFFICER",
        details: { email: officer.email, village_id: officer.village_id },
        ip_address: req.ip,
        user_agent: req.headers["user-agent"],
      });
    } catch (e) {}
    res.json({ success: true, message: "GN Officer deleted successfully." });
  } catch (error) {
    console.error("Delete officer error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── CREATE VILLAGE ────────────────────────────────────────
exports.createVillage = async (req, res) => {
  try {
    const { village_id, name, ds_division, district, province } = req.body;
    if (!village_id || !name || !ds_division || !district || !province) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }
    const existing = await Village.findOne({ $or: [{ village_id }, { name }] });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Village ID or Name already exists.",
      });
    }
    const village = new Village({
      village_id,
      name,
      ds_division,
      district,
      province,
    });
    await village.save();
    try {
      await AuditLog.create({
        user_type: "admin",
        user_id: req.user.id,
        user_model: "Admin",
        action: "CREATE_VILLAGE",
        details: { village_id, name },
        ip_address: req.ip,
        user_agent: req.headers["user-agent"],
      });
    } catch (e) {}
    res.status(201).json({ success: true, data: village });
  } catch (error) {
    console.error("Create village error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── DELETE VILLAGE ────────────────────────────────────────
exports.deleteVillage = async (req, res) => {
  try {
    const { id } = req.params;
    const village = await Village.findById(id);
    if (!village) {
      return res
        .status(404)
        .json({ success: false, message: "Village not found." });
    }
    const officer = await GNOfficer.findOne({ village_id: village.village_id });
    if (officer) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete village with assigned GN Officer.",
      });
    }
    await village.deleteOne();
    try {
      await AuditLog.create({
        user_type: "admin",
        user_id: req.user.id,
        user_model: "Admin",
        action: "DELETE_VILLAGE",
        details: { village_id: village.village_id, name: village.name },
        ip_address: req.ip,
        user_agent: req.headers["user-agent"],
      });
    } catch (e) {}
    res.json({ success: true, message: "Village deleted successfully." });
  } catch (error) {
    console.error("Delete village error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
