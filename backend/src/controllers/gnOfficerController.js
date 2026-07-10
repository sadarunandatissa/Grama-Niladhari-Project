const GNOfficer = require("../models/GNOfficer");
const bcrypt = require("bcryptjs");
const { validatePhone, validateEmail } = require("../utils/validators");

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
    if (!officer)
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });
    res.json({ success: true, data: officer });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { full_name, phone, email, current_password, new_password } =
      req.body;
    const officer = await GNOfficer.findById(req.user.id);
    if (!officer)
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });

    if (email && !validateEmail(email))
      return res.status(400).json({ success: false, message: "Invalid email" });
    if (phone && !validatePhone(phone))
      return res.status(400).json({ success: false, message: "Invalid phone" });

    if (full_name) officer.full_name = full_name.trim();
    if (phone) officer.phone = phone.trim();
    if (email) officer.email = email.trim().toLowerCase();

    if (current_password && new_password) {
      const isMatch = await bcrypt.compare(
        current_password,
        officer.password_hash,
      );
      if (!isMatch)
        return res
          .status(400)
          .json({ success: false, message: "Current password incorrect" });
      const salt = await bcrypt.genSalt(10);
      officer.password_hash = await bcrypt.hash(new_password, salt);
    }

    await officer.save();
    res.json({ success: true, message: "Profile updated", data: officer });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
