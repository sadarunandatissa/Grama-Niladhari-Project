const cron = require("node-cron");
const Announcement = require("../models/Announcement");
const GNOfficer = require("../models/GNOfficer");
const {
  publishAnnouncement,
} = require("../controllers/announcementController"); // we'll extract the publish function

// We need to expose publishAnnouncement from controller, so we'll refactor it into a service.

// Better: create a separate service function for publishing.
// For simplicity, we'll duplicate the logic here.

const publishScheduledAnnouncements = async () => {
  try {
    const now = new Date();
    const scheduled = await Announcement.find({
      status: "scheduled",
      scheduledAt: { $lte: now },
    }).populate("createdBy", "village_id");

    for (const ann of scheduled) {
      const officer = await GNOfficer.findById(ann.createdBy);
      if (!officer) continue;

      // Publish (using same logic as immediate)
      // We'll copy the publish logic here or refactor to a shared function.
      await publishAnnouncementLogic(ann, officer);
    }
  } catch (error) {
    console.error("Scheduler error:", error);
  }
};

// Shared publish logic (extracted from controller)
const publishAnnouncementLogic = async (announcement, officer) => {
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

  // Create notifications
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

// Export the scheduler to start
const startScheduler = () => {
  cron.schedule("* * * * *", () => {
    console.log("⏰ Checking scheduled announcements...");
    publishScheduledAnnouncements();
  });
};

module.exports = { startScheduler };
