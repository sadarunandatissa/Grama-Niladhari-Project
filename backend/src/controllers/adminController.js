const GNOfficer = require("../models/GNOfficer");
const Village = require("../models/Village");
const AuditLog = require("../models/AuditLog");
const bcrypt = require("bcryptjs");
const {
  validateEmail,
  validatePassword,
  validatePhone,
} = require("../utils/validators");

/**
 * Create a new GN Officer account (Admin only)
 * POST /api/admin/gn-officer
 * Requires: email, password, full_name, phone, village_id, profile_picture (optional)
 */
exports.createGNOfficer = async (req, res) => {
  try {
    const { email, password, full_name, phone, village_id } = req.body;

    // --- Input validation ---
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format." });
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
    if (!validatePhone(phone)) {
      return res
        .status(400)
        .json({ success: false, message: "Phone must be exactly 10 digits." });
    }
    if (!village_id) {
      return res
        .status(400)
        .json({ success: false, message: "Village selection is required." });
    }

    // Check if village exists
    const village = await Village.findOne({ village_id });
    if (!village) {
      return res
        .status(404)
        .json({ success: false, message: "Village not found." });
    }

    // Check if email already used
    const existing = await GNOfficer.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Email already registered as GN Officer.",
        });
    }

    // Check if village already has an officer
    const existingOfficer = await GNOfficer.findOne({ village_id });
    if (existingOfficer) {
      return res
        .status(400)
        .json({
          success: false,
          message: "This village already has a GN Officer.",
        });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Handle profile picture upload
    let profile_picture = null;
    if (req.file) {
      profile_picture = `/uploads/gn_officers/${req.file.filename}`;
    }

    // Create GN Officer
    const gnOfficer = new GNOfficer({
      email,
      password_hash,
      full_name: full_name.trim(),
      phone: phone.trim(),
      village_id,
      profile_picture,
      created_by: req.user.id, // Admin ID from JWT
    });
    await gnOfficer.save();

    // Audit log
    await AuditLog.create({
      user_type: "admin",
      user_id: req.user.id,
      user_model: "Admin",
      action: "CREATE_GN_OFFICER",
      details: { email, village_id, full_name },
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });

    res.status(201).json({
      success: true,
      message: "GN Officer created successfully.",
      data: { id: gnOfficer._id, email, full_name, village_id },
    });
  } catch (error) {
    console.error("Create GN Officer error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * Get all villages (for dropdown)
 * GET /api/admin/villages
 */
exports.getVillages = async (req, res) => {
  try {
    const villages = await Village.find().select("village_id name").lean();
    res.json({ success: true, data: villages });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};
