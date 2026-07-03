const Citizen = require("../models/Citizen");
const GNOfficer = require("../models/GNOfficer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * Login User
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Username, password, and role are required",
      });
    }

    let user;
    if (role === "citizen") {
      user = await Citizen.findOne({ username });
    } else if (role === "gn_officer") {
      user = await GNOfficer.findOne({ email: username });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "citizen" or "gn_officer"',
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.is_active === false) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact your GN Officer.",
      });
    }

    if (role === "citizen" && !user.is_verified) {
      return res.status(401).json({
        success: false,
        message:
          "Your account is not yet verified. Please wait for GN Officer verification.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: role,
        village_id: user.village_id,
        name: user.full_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const userResponse = {
      id: user._id,
      name: user.full_name,
      email: role === "gn_officer" ? user.email : user.username,
      role: role,
      village_id: user.village_id,
      is_head: user.is_head || false,
      is_verified: user.is_verified !== undefined ? user.is_verified : true,
    };

    res.json({
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

/**
 * Get Current User
 * GET /api/auth/me
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await Citizen.findById(req.user.id).select("-password_hash");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
