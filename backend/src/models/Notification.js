const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "recipientModel",
  },
  recipientModel: {
    type: String,
    enum: ["Citizen", "GNOfficer"],
    required: true,
    default: "Citizen",
  },
  type: {
    type: String,
    enum: [
      "certificate_ready",
      "certificate_rejected",
      "certificate_request",
      "verification",
      "appointment",
      "appointment_accepted",
      "appointment_rejected",
      "appointment_rescheduled",
      "warning",
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", NotificationSchema);
