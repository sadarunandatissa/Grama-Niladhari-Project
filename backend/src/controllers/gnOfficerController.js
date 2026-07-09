const GNOfficer = require("../models/GNOfficer");
const bcrypt = require("bcryptjs");
const { validatePhone, validateEmail } = require("../utils/validators");

// Get current GN Officer profile
exports.getProfile = async (req, res) => {
  try {
    const officer = await GNOfficer.findById(req.user.id)
      .populate({
        path: "village_id",
        model: "Village",
        select: "name village_id",
        foreignField: "village_id",
      })
      .select("-password_hash");
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "Officer not found." });
    }
    res.json({ success: true, data: officer });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Update GN Officer profile
exports.updateProfile = async (req, res) => {
  try {
    const { full_name, phone, email, current_password, new_password } =
      req.body;
    const officer = await GNOfficer.findById(req.user.id);
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "Officer not found." });
    }

    // Validate fields
    if (email && !validateEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format." });
    }
    if (phone && !validatePhone(phone)) {
      return res
        .status(400)
        .json({ success: false, message: "Phone must be 10 digits." });
    }

    // Update basic info
    if (full_name) officer.full_name = full_name.trim();
    if (phone) officer.phone = phone.trim();
    if (email) officer.email = email.trim().toLowerCase();

    // Update password if provided
    if (current_password && new_password) {
      const isMatch = await bcrypt.compare(
        current_password,
        officer.password_hash,
      );
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Current password is incorrect." });
      }
      const salt = await bcrypt.genSalt(10);
      officer.password_hash = await bcrypt.hash(new_password, salt);
    }

    await officer.save();
    res.json({
      success: true,
      message: "Profile updated successfully.",
      data: officer,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
