// backend/src/models/Notification.js

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
      // Certificate
      "certificate_ready",
      "certificate_rejected",
      "certificate_request",
      // Verification
      "verification",
      // Appointment
      "appointment",
      "appointment_accepted",
      "appointment_rejected",
      "appointment_rescheduled",
      // Permit
      "permit_request", // ✅ ADDED
      "permit_accepted", // ✅ ADDED
      "permit_rejected", // ✅ ADDED
      "permit_processing", // ✅ ADDED
      // Announcement
      "announcement",
      // General
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
