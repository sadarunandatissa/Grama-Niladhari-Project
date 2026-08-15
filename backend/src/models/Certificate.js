const mongoose = require("mongoose");

const CertificateSchema = new mongoose.Schema(
  {
    // Citizen who requested
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      required: true,
      index: true,
    },
    // Village for officer filtering
    village_id: {
      type: String,
      ref: "Village",
      required: true,
      index: true,
    },
    // Certificate type
    certificateType: {
      type: String,
      enum: ["residential", "income", "character"],
      required: true,
    },
    // Form data specific to each type (stored as JSON)
    formData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    // Status tracking
    status: {
      type: String,
      enum: ["not_seen", "in_progress", "completed"],
      default: "not_seen",
    },
    // Timestamps
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    lastStatusChangeAt: {
      type: Date,
      default: Date.now,
    },
    // GN Officer notes
    officerNotes: {
      type: String,
      default: "",
    },
    // For warning tracking
    warningSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Certificate", CertificateSchema);
