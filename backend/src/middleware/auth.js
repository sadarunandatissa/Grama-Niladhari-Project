const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const GNOfficer = require("../models/GNOfficer");
const Citizen = require("../models/Citizen");

/**
 * Protect routes – verify JWT token and set req.user
 */
exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Verify user exists in the correct collection
    let user;
    if (decoded.role === "admin") {
      user = await Admin.findById(decoded.id);
    } else if (decoded.role === "gn_officer") {
      user = await GNOfficer.findById(decoded.id);
    } else if (decoded.role === "citizen") {
      user = await Citizen.findById(decoded.id);
    } else {
      return res.status(401).json({ success: false, message: "Invalid role" });
    }

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }
    if (!user.is_active) {
      return res
        .status(401)
        .json({ success: false, message: "Account deactivated" });
    }

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

/**
 * Authorize – role-based access control
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  };
};
