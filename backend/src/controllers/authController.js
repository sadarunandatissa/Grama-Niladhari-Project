const Admin = require("../models/Admin");
const GNOfficer = require("../models/GNOfficer");
const Citizen = require("../models/Citizen");
const AuditLog = require("../models/AuditLog");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * Login - email + password, role-based
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Email, password, and role are required.",
        });
    }

    let user, userModel;
    if (role === "admin") {
      user = await Admin.findOne({ email });
      userModel = "Admin";
    } else if (role === "gn_officer") {
      user = await GNOfficer.findOne({ email });
      userModel = "GNOfficer";
    } else if (role === "citizen") {
      user = await Citizen.findOne({ email });
      userModel = "Citizen";
    } else {
      return res.status(400).json({ success: false, message: "Invalid role." });
    }

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    if (!user.is_active) {
      return res
        .status(401)
        .json({ success: false, message: "Account deactivated." });
    }

    // For citizen, check if verified
    if (role === "citizen" && !user.is_verified) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Account not verified. Please wait for GN Officer approval.",
        });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: role,
        village_id: user.village_id || null,
        name: user.full_name || user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Audit log
    await AuditLog.create({
      user_type: role,
      user_id: user._id,
      user_model: userModel,
      action: "LOGIN",
      details: { ip: req.ip },
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.full_name || user.email,
        email: user.email,
        role: role,
        village_id: user.village_id || null,
        profile_picture: user.profile_picture || null,
        is_verified: user.is_verified !== undefined ? user.is_verified : true,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
