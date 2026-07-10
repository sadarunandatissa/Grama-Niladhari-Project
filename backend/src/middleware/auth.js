const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const GNOfficer = require("../models/GNOfficer");
const Citizen = require("../models/Citizen");

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    let user;
    if (decoded.role === "admin") user = await Admin.findById(decoded.id);
    else if (decoded.role === "gn_officer")
      user = await GNOfficer.findById(decoded.id);
    else if (decoded.role === "citizen")
      user = await Citizen.findById(decoded.id);
    if (!user || !user.is_active)
      return res
        .status(401)
        .json({ success: false, message: "User not found or inactive" });
    next();
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  };
};
