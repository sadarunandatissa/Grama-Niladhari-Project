const Citizen = require("../models/Citizen");
const RegistrationRequest = require("../models/RegistrationRequest");

/**
 * Get citizen profile
 * GET /api/citizen/profile
 */
exports.getProfile = async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.user.id)
      .select("-password_hash")
      .populate("family_id", "family_reg_no");
    if (!citizen) {
      return res
        .status(404)
        .json({ success: false, message: "Citizen not found." });
    }
    res.json({ success: true, data: citizen });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * Get citizen service requests (certificates, permits, etc.)
 * GET /api/citizen/requests
 */
exports.getRequests = async (req, res) => {
  try {
    // For now, we fetch from RegistrationRequest (pending/verified/rejected)
    // Later you can add separate collections for certificates/permits
    const requests = await RegistrationRequest.find({
      citizen_id: req.user.id,
    }).sort({ createdAt: -1 });
    // Map to a simpler format
    const formatted = requests.map((r) => ({
      _id: r._id,
      type: r.is_family_head
        ? "Family Head Registration"
        : "Family Member Registration",
      status: r.status,
      createdAt: r.createdAt,
    }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
