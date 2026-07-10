const Admin = require("../models/Admin");
const GNOfficer = require("../models/GNOfficer");
const Citizen = require("../models/Citizen");
const AuditLog = require("../models/AuditLog");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    }

    let user, role, userModel;
    const admin = await Admin.findOne({ email });
    if (admin) {
      user = admin;
      role = "admin";
      userModel = "Admin";
    }
    if (!user) {
      const officer = await GNOfficer.findOne({ email });
      if (officer) {
        user = officer;
        role = "gn_officer";
        userModel = "GNOfficer";
      }
    }
    if (!user) {
      const citizen = await Citizen.findOne({ email });
      if (citizen) {
        user = citizen;
        role = "citizen";
        userModel = "Citizen";
      }
    }
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.is_active) {
      return res
        .status(401)
        .json({ success: false, message: "Account deactivated" });
    }
    if (role === "citizen" && !user.is_verified) {
      return res
        .status(401)
        .json({ success: false, message: "Account not verified" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role,
        village_id: user.village_id || null,
        name: user.full_name || user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    await AuditLog.create({
      user_type: role,
      user_id: user._id,
      user_model: userModel,
      action: "LOGIN",
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
        role,
        village_id: user.village_id || null,
        profile_picture: user.profile_picture || null,
        is_verified: user.is_verified !== undefined ? user.is_verified : true,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
