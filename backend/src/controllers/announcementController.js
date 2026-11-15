const Announcement = require("../models/Announcement");
const Citizen = require("../models/Citizen");
const GNOfficer = require("../models/GNOfficer");
const { publishAnnouncementLogic } = require("../services/announcementService");

// ─── Create Announcement ─────────────────────────────────
exports.createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      targetAudience,
      specificNICs,
      publishMode,
      scheduledAt,
      startDate,
      endDate,
    } = req.body;

    const officerId = req.user.id;
    const officer = await GNOfficer.findById(officerId);
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });
    }

    // Validate specificNICs if targetAudience is specific
    if (
      targetAudience === "specific" &&
      (!specificNICs || specificNICs.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one NIC for specific audience.",
      });
    }

    // Check if NICs exist (optional validation)
    if (targetAudience === "specific") {
      const citizens = await Citizen.find({
        nic: { $in: specificNICs },
        village_id: officer.village_id,
      });
      const foundNICs = citizens.map((c) => c.nic);
      const missing = specificNICs.filter((n) => !foundNICs.includes(n));
      if (missing.length > 0) {
        return res.status(400).json({
          success: false,
          message: `The following NICs are not registered in your village: ${missing.join(", ")}`,
        });
      }
    }

    // Handle file uploads
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(
        (file) => `/uploads/announcements/${file.filename}`,
      );
    }

    const announcement = new Announcement({
      title: title.trim(),
      description: description.trim(),
      priority: priority || "Normal",
      targetAudience,
      specificNICs: targetAudience === "specific" ? specificNICs : [],
      publishMode,
      scheduledAt: publishMode === "scheduled" ? new Date(scheduledAt) : null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      attachments,
      status: publishMode === "immediate" ? "draft" : "scheduled", // will be published via scheduler
      createdBy: officerId,
      village_id: officer.village_id,
    });
    await announcement.save();

    // If immediate publish, publish now
    let delivery;
    if (publishMode === "immediate") {
      delivery = await publishAnnouncementLogic(announcement, officer);
    }

    res.status(201).json({
      success: true,
      message:
        publishMode === "immediate"
          ? delivery.smsFailed > 0
            ? `Announcement published, but SMS delivery failed for ${delivery.smsFailed} recipient(s).`
            : "Announcement published successfully."
          : "Announcement scheduled successfully.",
      data: announcement,
    });
  } catch (error) {
    console.error("Create announcement error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Get Announcements for Officer ────────────────────────
exports.getOfficerAnnouncements = async (req, res) => {
  try {
    const officerId = req.user.id;
    const officer = await GNOfficer.findById(officerId);
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });
    }

    const announcements = await Announcement.find({
      village_id: officer.village_id,
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: announcements });
  } catch (error) {
    console.error("Get officer announcements error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Get Announcements for Residents ──────────────────────
exports.getResidentAnnouncements = async (req, res) => {
  try {
    const citizenId = req.user.id;
    const citizen = await Citizen.findById(citizenId);
    if (!citizen) {
      return res
        .status(404)
        .json({ success: false, message: "Citizen not found" });
    }

    // Get all published announcements for the village
    const now = new Date();
    const announcements = await Announcement.find({
      village_id: citizen.village_id,
      status: "published",
      $or: [{ startDate: { $lte: now } }, { startDate: null }],
      $or: [{ endDate: { $gte: now } }, { endDate: null }],
    }).sort({ priority: -1, createdAt: -1 }); // Emergency first

    // If targetAudience is specific, only show if citizen's NIC is in the list
    const filtered = announcements.filter((a) => {
      if (a.targetAudience === "all") return true;
      return a.specificNICs.includes(citizen.nic);
    });

    res.json({ success: true, data: filtered });
  } catch (error) {
    console.error("Get resident announcements error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Get Single Announcement (for both) ──────────────────
exports.getAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found" });
    }
    res.json({ success: true, data: announcement });
  } catch (error) {
    console.error("Get announcement error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Delete Announcement (soft delete or hard) ──────────
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const officerId = req.user.id;
    const officer = await GNOfficer.findById(officerId);
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });
    }

    const announcement = await Announcement.findOne({
      _id: id,
      village_id: officer.village_id,
    });
    if (!announcement) {
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found" });
    }

    await announcement.deleteOne();
    res.json({ success: true, message: "Announcement deleted." });
  } catch (error) {
    console.error("Delete announcement error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
