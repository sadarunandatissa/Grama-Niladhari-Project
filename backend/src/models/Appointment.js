const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Citizen",
    required: true,
    index: true,
  },
  village_id: {
    type: String,
    ref: "Village",
    required: true,
    index: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
  },
  proposedSlots: {
    type: [Date],
    required: true,
    validate: {
      validator: function (v) {
        return v && v.length > 0 && v.length <= 5;
      },
      message: "You must provide between 1 and 5 slots.",
    },
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "rescheduled"],
    default: "pending",
  },
  selectedSlot: {
    type: Date,
    default: null,
  },
  officerMessage: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure slots are within working hours and days (Mon-Fri, 8am-4pm)
AppointmentSchema.pre("save", function (next) {
  const slots = this.proposedSlots;
  for (let slot of slots) {
    const day = slot.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    if (day === 0 || day === 6) {
      throw new Error("Appointments are only available Monday to Friday.");
    }
    const hours = slot.getHours();
    if (hours < 8 || hours >= 16) {
      throw new Error(
        "Appointments are only available from 8:00 AM to 4:00 PM.",
      );
    }
  }
  next();
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
