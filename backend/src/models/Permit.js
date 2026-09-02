const mongoose = require("mongoose");

const PermitSchema = new mongoose.Schema(
  {
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
    permitType: {
      type: String,
      enum: ["timber", "sand"],
      required: true,
    },
    formData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ["not_seen", "in_progress", "accepted", "rejected"],
      default: "not_seen",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    lastStatusChangeAt: {
      type: Date,
      default: Date.now,
    },
    officerNotes: {
      type: String,
      default: "",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    warningSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Permit", PermitSchema);
