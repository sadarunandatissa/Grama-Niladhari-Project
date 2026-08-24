const Citizen = require("../models/Citizen");
const Notification = require("../models/Notification");
const sendSMS = require("./smsService");

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
      let primary = c.phone_numbers[0].trim();
      if (!primary.startsWith("+")) {
        if (primary.startsWith("0")) {
          primary = "+94" + primary.substring(1);
        } else {
          primary = "+94" + primary;
        }
      }
      phones.push(primary);
    }
  });
  return phones;
};

const publishAnnouncementLogic = async (announcement, officer) => {
  announcement.status = "published";
  announcement.sentAt = new Date();
  await announcement.save();

  const citizens = await getTargetCitizens(
    announcement.village_id,
    announcement.targetAudience,
    announcement.specificNICs,
  );

  const notificationPromises = citizens.map((citizen) => {
    return Notification.create({
      recipientId: citizen._id,
      recipientModel: "Citizen",
      type: "announcement",
      title: `📢 ${announcement.title}`,
      message: announcement.description,
      link: `/citizen/announcements/${announcement._id}`,
      isRead: false,
    });
  });
  await Promise.all(notificationPromises);

  const phones = await getTargetPhoneNumbers(
    announcement.village_id,
    announcement.targetAudience,
    announcement.specificNICs,
  );
  const smsMessage = `📢 ${announcement.title}\n\n${announcement.description}`;
  const smsPromises = phones.map((phone) => sendSMS(phone, smsMessage));
  await Promise.all(smsPromises);
};

module.exports = {
  getTargetCitizens,
  getTargetPhoneNumbers,
  publishAnnouncementLogic,
};
