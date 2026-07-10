const Citizen = require("../models/Citizen");
const RegistrationRequest = require("../models/RegistrationRequest");

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
