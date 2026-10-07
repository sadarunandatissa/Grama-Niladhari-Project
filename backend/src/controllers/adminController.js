const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const GNOfficer = require("../models/GNOfficer");
const Citizen = require("../models/Citizen");
const RegistrationRequest = require("../models/RegistrationRequest");
const Village = require("../models/Village");
const DSDivision = require("../models/DSDivision");

/* -------------------------------------------------
   GET all villages (with populated hierarchy)
------------------------------------------------- */
exports.getVillages = async (req, res) => {
  try {
    const villages = await Village.find()
      .populate({
        path: "dsDivision",
        populate: {
          path: "district",
          populate: { path: "province" },
        },
      })
      .sort("name");

    return res.status(200).json({ success: true, data: villages });
  } catch (err) {
    console.error("getVillages error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch villages" });
  }
};

/* -------------------------------------------------
   DELETE a village
------------------------------------------------- */
exports.deleteVillage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid village ID" });
    }

    const village = await Village.findById(id);
    if (!village) {
      return res
        .status(404)
        .json({ success: false, message: "Village not found" });
    }

    const [officerCount, citizenCount] = await Promise.all([
      GNOfficer.countDocuments({ village_id: id }),
      Citizen.countDocuments({ village_id: id }),
    ]);
    const assignedCount = officerCount + citizenCount;
    if (assignedCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete. ${assignedCount} user(s) are assigned to this village.`,
      });
    }

    await Village.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ success: true, message: "Village deleted successfully" });
  } catch (err) {
    console.error("deleteVillage error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete village" });
  }
};

/* -------------------------------------------------
   GET stats
------------------------------------------------- */
exports.getStats = async (req, res) => {
  try {
    const [totalVillages, totalOfficers, totalCitizens, pendingRegistrations] =
      await Promise.all([
        Village.countDocuments(),
        GNOfficer.countDocuments(),
        Citizen.countDocuments(),
        RegistrationRequest.countDocuments({ status: "pending" }),
      ]);

    return res.status(200).json({
      success: true,
      data: {
        totalVillages,
        totalOfficers,
        totalCitizens,
        pendingRegistrations,
      },
    });
  } catch (err) {
    console.error("getStats error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch stats" });
  }
};

/* -------------------------------------------------
   GET all GN Officers
------------------------------------------------- */
exports.getAllGNOfficers = async (req, res) => {
  try {
    const officers = await GNOfficer.find()
      .select("-password_hash")
      .sort({ full_name: 1 })
      .lean();

    const formattedOfficers = await Promise.all(
      officers.map(async (officer) => {
        if (!officer.village_id || !mongoose.Types.ObjectId.isValid(officer.village_id)) {
          return { ...officer, village: null };
        }

        const village = await Village.findById(officer.village_id)
          .populate({
            path: "dsDivision",
            populate: {
              path: "district",
              populate: { path: "province" },
            },
          })
          .lean();

        return { ...officer, village };
      }),
    );

    return res.status(200).json({ success: true, data: formattedOfficers });
  } catch (err) {
    console.error("getAllGNOfficers error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch GN officers" });
  }
};

/* -------------------------------------------------
   CREATE GN Officer
------------------------------------------------- */
exports.createGNOfficer = async (req, res) => {
  try {
    const {
      email,
      password,
      full_name,
      phone,
      village_id, // This is now a Village ObjectId
    } = req.body;

    if (!email || !password || !full_name || !phone || !village_id) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(village_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid village ID" });
    }

    const village = await Village.findById(village_id);
    if (!village) {
      return res
        .status(404)
        .json({ success: false, message: "Selected village not found" });
    }

    const existing = await GNOfficer.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const officerData = {
      email: email.toLowerCase(),
      password_hash,
      full_name,
      phone,
      village_id,
      created_by: req.user?._id || req.user?.id,
      is_active: true,
    };

    if (req.file) {
      officerData.profile_picture = `/uploads/${req.file.filename}`;
    }

    const officer = await GNOfficer.create(officerData);

    return res.status(201).json({
      success: true,
      message: "GN Officer created successfully",
      data: {
        _id: officer._id,
        email: officer.email,
        full_name: officer.full_name,
        phone: officer.phone,
        village_id: officer.village_id,
        role: "gn_officer",
      },
    });
  } catch (err) {
    console.error("createGNOfficer error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create GN Officer" });
  }
};

/* -------------------------------------------------
   DELETE GN Officer
------------------------------------------------- */
exports.deleteGNOfficer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid officer ID" });
    }

    const officer = await GNOfficer.findById(id);
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "GN Officer not found" });
    }

    await GNOfficer.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ success: true, message: "GN Officer deleted successfully" });
  } catch (err) {
    console.error("deleteGNOfficer error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete GN Officer" });
  }
};

/* -------------------------------------------------
   (Optional) Keep createVillage for backwards compat
   — but delegate to the same logic as /api/location/villages
------------------------------------------------- */
exports.createVillage = async (req, res) => {
  try {
    const { name, dsDivisionId } = req.body;

    if (!name || !dsDivisionId) {
      return res.status(400).json({
        success: false,
        message: "Village name and DS Division are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(dsDivisionId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid DS Division ID" });
    }

    const ds = await DSDivision.findById(dsDivisionId);
    if (!ds) {
      return res
        .status(404)
        .json({ success: false, message: "DS Division not found" });
    }

    const existing = await Village.findOne({
      name: name.trim(),
      dsDivision: dsDivisionId,
    });
    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Village already exists in this DS Division",
        });
    }

    const village = await Village.create({
      name: name.trim(),
      dsDivision: dsDivisionId,
    });

    return res.status(201).json({
      success: true,
      message: "Village created successfully",
      data: village,
    });
  } catch (err) {
    console.error("createVillage error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create village" });
  }
};
