const jwt = require("jsonwebtoken");
const GNOfficer = require("../models/GNOfficer");
const Citizen = require("../models/Citizen");

/**
 * Protect routes - Verify JWT token
 */
exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Verify user still exists and is active
    let user;
    if (decoded.role === "gn_officer") {
      user = await GNOfficer.findById(decoded.id);
    } else if (decoded.role === "citizen") {
      user = await Citizen.findById(decoded.id);
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid user role",
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.is_active === false) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Authorize - Role-based access control
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${req.user.role} role is not authorized for this action.`,
      });
    }
    next();
  };
};

/**
 * Verify GN Officer's village matches the registration's village
 */
exports.verifyVillageOwnership = async (req, res, next) => {
  try {
    const registration = await RegistrationRequest.findById(
      req.params.registration_id,
    );
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    const officer = await GNOfficer.findById(req.user.id);
    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "GN Officer not found",
      });
    }

    const village = await Village.findOne({ name: registration.village });
    if (!village || village.village_id !== officer.village_id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to process this registration",
      });
    }

    req.registration = registration;
    next();
  } catch (error) {
    console.error("Village ownership verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
