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

// backend/src/controllers/gnOfficerController.js

// ... existing functions ...

/**
 * Get residents in the officer's village (with search)
 * GET /api/gn-officer/residents?search=...
 */
exports.getVillageResidents = async (req, res) => {
  try {
    const officerId = req.user.id;
    const officer = await GNOfficer.findById(officerId);
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });
    }

    const { search } = req.query;
    const filter = { village_id: officer.village_id, is_active: true };

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { full_name: regex },
        { nic: regex },
        { phone_numbers: { $elemMatch: { $regex: regex } } },
      ];
    }

    const citizens = await Citizen.find(filter)
      .select("full_name nic phone_numbers address family_id is_head")
      .populate("family_id", "family_reg_no")
      .sort({ full_name: 1 });

    res.json({ success: true, data: citizens });
  } catch (error) {
    console.error("Get village residents error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get full resident details (with family members and lands)
 * GET /api/gn-officer/residents/:id
 */
exports.getResidentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const officerId = req.user.id;

    // Verify officer belongs to the same village
    const officer = await GNOfficer.findById(officerId);
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });
    }

    const citizen = await Citizen.findOne({
      _id: id,
      village_id: officer.village_id,
      is_active: true,
    }).select("-password_hash");

    if (!citizen) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Resident not found in your village",
        });
    }

    // Get family members (if citizen has a family)
    let familyMembers = [];
    let familyDetails = null;
    if (citizen.family_id) {
      const family = await Family.findById(citizen.family_id).populate(
        "members",
        "full_name nic phone_numbers is_head",
      );
      familyDetails = family;
      familyMembers = family.members || [];
    }

    // Get lands owned by this citizen (using NIC)
    const lands = await Land.find({
      owner_nic: citizen.nic,
      is_active: true,
    }).lean();

    // Also get lands where citizen is real owner (if gift land)
    const giftLands = await Land.find({
      real_owner_nic: citizen.nic,
      is_active: true,
    }).lean();

    const allLands = [...lands, ...giftLands];

    res.json({
      success: true,
      data: {
        citizen,
        family: familyDetails,
        familyMembers,
        lands: allLands,
      },
    });
  } catch (error) {
    console.error("Get resident details error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
