// src/controllers/citizenController.js

const Citizen = require("../models/Citizen");
const Family = require("../models/Family");
const RegistrationRequest = require("../models/RegistrationRequest");
const { generateFamilyRegNo } = require("../utils/helpers");

// ─── GET PROFILE ──────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.user.id)
      .populate({
        path: "village_id",
        model: "Village",
        select: "name village_id",
        foreignField: "village_id",
      })
      .populate({
        path: "family_id",
        model: "Family",
        select: "family_reg_no members head_citizen_id",
      })
      .select("-password_hash");
    if (!citizen) {
      return res
        .status(404)
        .json({ success: false, message: "Citizen not found" });
    }
    res.json({ success: true, data: citizen });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GET REQUESTS ──────────────────────────────────────────
exports.getRequests = async (req, res) => {
  try {
    const requests = await RegistrationRequest.find({
      citizen_id: req.user.id,
    }).sort({ created_at: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── CREATE FAMILY (by Family Head) ──────────────────────
exports.createFamily = async (req, res) => {
  try {
    const { address, family_type } = req.body;
    const citizenId = req.user.id;

    const citizen = await Citizen.findById(citizenId);
    if (!citizen) {
      return res
        .status(404)
        .json({ success: false, message: "Citizen not found." });
    }
    if (citizen.family_id) {
      return res
        .status(400)
        .json({ success: false, message: "You already belong to a family." });
    }
    if (!citizen.is_head) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only family heads can create a family.",
        });
    }

    // Generate family registration number
    const familyRegNo = await generateFamilyRegNo(citizen.village_id);

    const family = new Family({
      village_id: citizen.village_id,
      family_reg_no: familyRegNo,
      head_citizen_id: citizen._id,
      members: [citizen._id],
      address: address || citizen.address,
      family_type: family_type || "Nuclear",
    });
    await family.save();

    citizen.family_id = family._id;
    await citizen.save();

    res.status(201).json({
      success: true,
      message: "Family created successfully.",
      data: {
        family_id: family._id,
        family_reg_no: familyRegNo,
        address: family.address,
        family_type: family.family_type,
        members: family.members,
      },
    });
  } catch (error) {
    console.error("Create family error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
