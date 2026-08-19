const Announcement = require("../models/Announcement");
const Citizen = require("../models/Citizen");
const GNOfficer = require("../models/GNOfficer");
const Notification = require("../models/Notification");
const sendSMS = require("../services/smsService");

// ─── Helpers ──────────────────────────────────────────────
// Get all citizen phone numbers in a village (or specific NICs)
const getTargetPhoneNumbers = async (
  villageId,
  targetAudience,
  specificNICs,
) => {
  let filter = { village_id: villageId, is_active: true };
  if (
    targetAudience === "specific" &&
    specificNICs &&
    specificNICs.length > 0
  ) {
    filter.nic = { $in: specificNICs };
  }
  const citizens = await Citizen.find(filter).select("phone_numbers");
  const phones = [];
  citizens.forEach((c) => {
    if (c.phone_numbers && c.phone_numbers.length > 0) {
      const primary = c.phone_numbers[0];
      // Ensure phone has country code (add +94 if not present)
      let formatted = primary.trim();
      if (!formatted.startsWith("+")) {
        if (formatted.startsWith("0")) {
          formatted = "+94" + formatted.substring(1);
        } else {
          formatted = "+94" + formatted;
        }
      }
      phones.push(formatted);
    }
  });
  return phones;
};

// Get target citizens for notifications (full objects)
const getTargetCitizens = async (villageId, targetAudience, specificNICs) => {
  let filter = { village_id: villageId, is_active: true };
  if (
    targetAudience === "specific" &&
    specificNICs &&
    specificNICs.length > 0
  ) {
    filter.nic = { $in: specificNICs };
  }
  return await Citizen.find(filter).select("_id");
};

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
      return res
        .status(400)
        .json({
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
    if (publishMode === "immediate") {
      await publishAnnouncement(announcement, officer);
    }

    res.status(201).json({
      success: true,
      message:
        publishMode === "immediate"
          ? "Announcement published successfully."
          : "Announcement scheduled successfully.",
      data: announcement,
    });
  } catch (error) {
    console.error("Create announcement error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Publish Announcement (internal) ──────────────────────
const publishAnnouncement = async (announcement, officer) => {
  // Update status
  announcement.status = "published";
  announcement.sentAt = new Date();
  await announcement.save();

  // Get target citizens
  const citizens = await getTargetCitizens(
    announcement.village_id,
    announcement.targetAudience,
    announcement.specificNICs,
  );

  // Create in-app notifications for each citizen
  const notificationPromises = citizens.map((citizen) => {
    return Notification.create({
      recipientId: citizen._id,
      recipientModel: "Citizen",
      type: "announcement",
      title: `📢 ${announcement.title}`,
      message: announcement.description,
      link: `/citizen/announcements/${announcement._id}`,
      priority: announcement.priority,
      isRead: false,
    });
  });
  await Promise.all(notificationPromises);

  // Send SMS
  const phones = await getTargetPhoneNumbers(
    announcement.village_id,
    announcement.targetAudience,
    announcement.specificNICs,
  );
  const smsMessage = `📢 ${announcement.title}\n\n${announcement.description}`;
  const smsPromises = phones.map((phone) => sendSMS(phone, smsMessage));
  await Promise.all(smsPromises);
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
