const Land = require("../models/Land");
const LandCounter = require("../models/LandCounter");
const Citizen = require("../models/Citizen");
const GNOfficer = require("../models/GNOfficer");
const Village = require("../models/Village");

// ─── HELPERS ──────────────────────────────────────────────

// Generate sequential land ID
const generateLandId = async (villageId) => {
  let counter = await LandCounter.findOne({ village_id: villageId });
  if (!counter) {
    counter = new LandCounter({ village_id: villageId, sequence: 0 });
  }
  counter.sequence += 1;
  await counter.save();
  const padded = String(counter.sequence).padStart(4, "0");
  return `${villageId}-LAND-${padded}`;
};

// ─── CRUD OPERATIONS ──────────────────────────────────────

// ─── CREATE LAND (GN Officer) ────────────────────────────
exports.createLand = async (req, res) => {
  try {
    const {
      owner_nic,
      size_value,
      size_unit,
      type,
      owner_type,
      real_owner_nic,
      location_description,
      survey_number,
    } = req.body;

    const officerId = req.user.id;

    // 1. Get officer to verify village
    const officer = await GNOfficer.findById(officerId);
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });
    }

    // 2. Validate owner NIC
    if (!owner_nic || owner_nic.trim().length < 5) {
      return res
        .status(400)
        .json({ success: false, message: "Owner NIC is required." });
    }
    const ownerNic = owner_nic.trim().toUpperCase();

    // 3. Check if owner exists as a citizen (in any village)
    const owner = await Citizen.findOne({ nic: ownerNic });
    if (!owner) {
      return res.status(400).json({
        success: false,
        message: "Citizen with this NIC is not registered in the system.",
      });
    }

    // 4. Validate size
    if (!size_value || size_value <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Valid land size is required." });
    }
    if (!["acres", "perches"].includes(size_unit)) {
      return res.status(400).json({
        success: false,
        message: "Invalid size unit. Use acres or perches.",
      });
    }

    // 5. Validate type
    if (!["land", "paddy_field"].includes(type)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid land type." });
    }

    // 6. Validate owner_type
    if (!["my_own_land", "gift_land"].includes(owner_type)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid owner type." });
    }

    // 7. If gift_land, validate real_owner_nic
    if (owner_type === "gift_land") {
      if (!real_owner_nic || real_owner_nic.trim().length < 5) {
        return res.status(400).json({
          success: false,
          message: "Real owner NIC is required for gift land.",
        });
      }
      const realOwnerNic = real_owner_nic.trim().toUpperCase();
      const realOwner = await Citizen.findOne({ nic: realOwnerNic });
      if (!realOwner) {
        return res.status(400).json({
          success: false,
          message: "Real owner with this NIC is not registered in the system.",
        });
      }
    }

    // 8. Generate unique land ID
    const landId = await generateLandId(officer.village_id);

    // 9. Create land record
    const land = new Land({
      land_id: landId,
      village_id: officer.village_id,
      owner_nic: ownerNic,
      size: {
        value: size_value,
        unit: size_unit,
      },
      type: type,
      owner_type: owner_type,
      real_owner_nic:
        owner_type === "gift_land" ? real_owner_nic.trim().toUpperCase() : null,
      location_description: location_description || "",
      survey_number: survey_number || "",
      created_by: officerId,
      is_active: true,
    });

    await land.save();

    res.status(201).json({
      success: true,
      message: "Land record created successfully.",
      data: land,
    });
  } catch (error) {
    console.error("Create land error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error: " + error.message });
  }
};

// ─── GET ALL LANDS (GN Officer - Village Filtered) ──────
exports.getLands = async (req, res) => {
  try {
    const officerId = req.user.id;
    const officer = await GNOfficer.findById(officerId);
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });
    }

    const { search, type, owner_type } = req.query;
    const filter = { village_id: officer.village_id, is_active: true };

    if (search) {
      filter.$or = [
        { land_id: { $regex: search, $options: "i" } },
        { owner_nic: { $regex: search, $options: "i" } },
        { survey_number: { $regex: search, $options: "i" } },
      ];
    }
    if (type) filter.type = type;
    if (owner_type) filter.owner_type = owner_type;

    const lands = await Land.find(filter).sort({ createdAt: -1 });

    // Enrich with owner details
    const enrichedLands = await Promise.all(
      lands.map(async (land) => {
        const owner = await Citizen.findOne({ nic: land.owner_nic }).select(
          "full_name address phone village_id",
        );
        let realOwner = null;
        if (land.real_owner_nic) {
          realOwner = await Citizen.findOne({
            nic: land.real_owner_nic,
          }).select("full_name address phone");
        }
        return {
          ...land.toObject(),
          owner_name: owner?.full_name || "Unknown",
          owner_address: owner?.address || "N/A",
          owner_village: owner?.village_id || "N/A",
          real_owner_name: realOwner?.full_name || null,
        };
      }),
    );

    res.json({
      success: true,
      data: enrichedLands,
    });
  } catch (error) {
    console.error("Get lands error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GET A SINGLE LAND ─────────────────────────────────────
exports.getLandById = async (req, res) => {
  try {
    const { id } = req.params;
    const officerId = req.user.id;
    const officer = await GNOfficer.findById(officerId);
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });
    }

    const land = await Land.findOne({
      _id: id,
      village_id: officer.village_id,
    });
    if (!land) {
      return res
        .status(404)
        .json({ success: false, message: "Land record not found" });
    }

    const owner = await Citizen.findOne({ nic: land.owner_nic }).select(
      "full_name address phone",
    );
    let realOwner = null;
    if (land.real_owner_nic) {
      realOwner = await Citizen.findOne({ nic: land.real_owner_nic }).select(
        "full_name address phone",
      );
    }

    res.json({
      success: true,
      data: {
        ...land.toObject(),
        owner_name: owner?.full_name || "Unknown",
        owner_address: owner?.address || "N/A",
        real_owner_name: realOwner?.full_name || null,
      },
    });
  } catch (error) {
    console.error("Get land error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── UPDATE LAND ──────────────────────────────────────────
exports.updateLand = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      size_value,
      size_unit,
      type,
      owner_type,
      real_owner_nic,
      location_description,
      survey_number,
    } = req.body;

    const officerId = req.user.id;
    const officer = await GNOfficer.findById(officerId);
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });
    }

    const land = await Land.findOne({
      _id: id,
      village_id: officer.village_id,
    });
    if (!land) {
      return res
        .status(404)
        .json({ success: false, message: "Land record not found" });
    }

    // Validate and update fields
    if (size_value !== undefined) {
      if (size_value <= 0) {
        return res.status(400).json({
          success: false,
          message: "Land size must be greater than 0.",
        });
      }
      land.size.value = size_value;
    }
    if (size_unit && ["acres", "perches"].includes(size_unit)) {
      land.size.unit = size_unit;
    }
    if (type && ["land", "paddy_field"].includes(type)) {
      land.type = type;
    }
    if (owner_type && ["my_own_land", "gift_land"].includes(owner_type)) {
      land.owner_type = owner_type;
      if (owner_type === "gift_land") {
        if (!real_owner_nic || real_owner_nic.trim().length < 5) {
          return res.status(400).json({
            success: false,
            message: "Real owner NIC is required for gift land.",
          });
        }
        const realOwner = await Citizen.findOne({
          nic: real_owner_nic.trim().toUpperCase(),
        });
        if (!realOwner) {
          return res.status(400).json({
            success: false,
            message:
              "Real owner with this NIC is not registered in the system.",
          });
        }
        land.real_owner_nic = real_owner_nic.trim().toUpperCase();
      } else {
        land.real_owner_nic = null;
      }
    }
    if (location_description !== undefined) {
      land.location_description = location_description || "";
    }
    if (survey_number !== undefined) {
      land.survey_number = survey_number || "";
    }

    land.updated_by = officerId;
    await land.save();

    res.json({
      success: true,
      message: "Land record updated successfully.",
      data: land,
    });
  } catch (error) {
    console.error("Update land error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── DELETE LAND (Soft Delete) ───────────────────────────
exports.deleteLand = async (req, res) => {
  try {
    const { id } = req.params;
    const officerId = req.user.id;
    const officer = await GNOfficer.findById(officerId);
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });
    }

    const land = await Land.findOne({
      _id: id,
      village_id: officer.village_id,
    });
    if (!land) {
      return res
        .status(404)
        .json({ success: false, message: "Land record not found" });
    }

    // Soft delete
    land.is_active = false;
    land.updated_by = officerId;
    await land.save();

    res.json({
      success: true,
      message: "Land record deleted successfully.",
    });
  } catch (error) {
    console.error("Delete land error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GET LAND STATS ──────────────────────────────────────
exports.getLandStats = async (req, res) => {
  try {
    const officerId = req.user.id;
    const officer = await GNOfficer.findById(officerId);
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });
    }

    const totalLands = await Land.countDocuments({
      village_id: officer.village_id,
      is_active: true,
    });
    const totalLandType = await Land.countDocuments({
      village_id: officer.village_id,
      type: "land",
      is_active: true,
    });
    const totalPaddyFields = await Land.countDocuments({
      village_id: officer.village_id,
      type: "paddy_field",
      is_active: true,
    });
    const totalOwnLands = await Land.countDocuments({
      village_id: officer.village_id,
      owner_type: "my_own_land",
      is_active: true,
    });
    const totalGiftLands = await Land.countDocuments({
      village_id: officer.village_id,
      owner_type: "gift_land",
      is_active: true,
    });

    // Get total land size (sum of acres)
    const lands = await Land.find({
      village_id: officer.village_id,
      is_active: true,
    });
    let totalAcres = 0;
    lands.forEach((land) => {
      if (land.size.unit === "acres") {
        totalAcres += land.size.value;
      } else {
        totalAcres += land.size.value / 16; // Convert perches to acres (1 acre = 16 perches)
      }
    });

    res.json({
      success: true,
      data: {
        totalLands,
        totalLandType,
        totalPaddyFields,
        totalOwnLands,
        totalGiftLands,
        totalAcres: Math.round(totalAcres * 100) / 100,
      },
    });
  } catch (error) {
    console.error("Get land stats error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
