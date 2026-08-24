const cron = require("node-cron");
const Announcement = require("../models/Announcement");
const GNOfficer = require("../models/GNOfficer");
const { publishAnnouncementLogic } = require("../services/announcementService");

const publishScheduledAnnouncements = async () => {
  try {
    const now = new Date();
    const scheduled = await Announcement.find({
      status: "scheduled",
      scheduledAt: { $lte: now },
    });

    for (const ann of scheduled) {
      const officer = await GNOfficer.findById(ann.createdBy);
      if (!officer) continue;
      await publishAnnouncementLogic(ann, officer);
    }
  } catch (error) {
    console.error("Scheduler error:", error);
  }
};

const startScheduler = () => {
  // Run every minute
  cron.schedule("* * * * *", () => {
    console.log("⏰ Checking scheduled announcements...");
    publishScheduledAnnouncements();
  });
};

module.exports = { startScheduler };
