// backend/src/controllers/authController.js

const Admin = require("../models/Admin");
const GNOfficer = require("../models/GNOfficer");
const Citizen = require("../models/Citizen");
const AuditLog = require("../models/AuditLog");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * Login - email + password only (auto-detect role)
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    let user, role, userModel;

    // 1️⃣ Check Admin collection
    const admin = await Admin.findOne({ email });
    if (admin) {
      user = admin;
      role = "admin";
      userModel = "Admin";
    }

    // 2️⃣ If not admin, check GN Officer
    if (!user) {
      const officer = await GNOfficer.findOne({ email });
      if (officer) {
        user = officer;
        role = "gn_officer";
        userModel = "GNOfficer";
      }
    }

    // 3️⃣ If not officer, check Citizen
    if (!user) {
      const citizen = await Citizen.findOne({ email });
      if (citizen) {
        user = citizen;
        role = "citizen";
        userModel = "Citizen";
      }
    }

    // If no user found in any collection
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // Check if account is active
    if (user.is_active === false) {
      return res.status(401).json({
        success: false,
        message: "Account deactivated. Please contact support.",
      });
    }

    // For citizens, check if verified
    if (role === "citizen" && !user.is_verified) {
      return res.status(401).json({
        success: false,
        message: "Account not verified. Please wait for GN Officer approval.",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // Generate JWT with role
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

    // Return user data including role
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.full_name || user.email,
        email: user.email,
        role: role, // ✅ role is auto-detected
        village_id: user.village_id || null,
        profile_picture: user.profile_picture || null,
        is_verified: user.is_verified !== undefined ? user.is_verified : true,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};
