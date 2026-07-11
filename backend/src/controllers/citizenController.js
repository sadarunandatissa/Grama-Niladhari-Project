const Citizen = require("../models/Citizen");
const Family = require("../models/Family");
const RegistrationRequest = require("../models/RegistrationRequest");
const { generateFamilyRegNo } = require("../utils/helpers");

exports.getProfile = async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.user.id)
      .populate({
        path: "village_id",
        model: "Village",
        select: "name",
        foreignField: "village_id",
      })
      .select("-password_hash");
    if (!citizen)
      return res
        .status(404)
        .json({ success: false, message: "Citizen not found" });
    res.json({ success: true, data: citizen });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const requests = await RegistrationRequest.find({
      citizen_id: req.user.id,
    }).sort({ created_at: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createFamily = async (req, res) => {
  try {
    const citizenId = req.user.id;

    // 1. Find citizen
    const citizen = await Citizen.findById(citizenId);
    if (!citizen) {
      return res
        .status(404)
        .json({ success: false, message: "Citizen not found." });
    }

    // 2. Check if already has a family
    if (citizen.family_id) {
      return res
        .status(400)
        .json({ success: false, message: "You already belong to a family." });
    }

    // 3. Ensure citizen is marked as head (this should be set during verification)
    if (!citizen.is_head) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only family heads can create a family.",
        });
    }

    // 4. Generate new family registration number
    const familyRegNo = await generateFamilyRegNo(citizen.village_id);

    // 5. Create family
    const family = new Family({
      village_id: citizen.village_id,
      family_reg_no: familyRegNo,
      head_citizen_id: citizen._id,
      members: [citizen._id],
    });
    await family.save();

    // 6. Update citizen with family_id
    citizen.family_id = family._id;
    await citizen.save();

    // 7. (Optional) Update any pending registration requests to link the family
    //    Not needed for new flow.

    res.status(201).json({
      success: true,
      message: "Family created successfully.",
      data: { family_id: family._id, family_reg_no: familyRegNo },
    });
  } catch (error) {
    console.error("Create family error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
