const mongoose = require("mongoose");

const CertificateSchema = new mongoose.Schema(
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
    certificateType: {
      type: String,
      enum: ["residential", "income", "character"],
      required: true,
    },
    formData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    attachments: {
      type: [String], // file paths
      default: [],
    },
    status: {
      type: String,
      enum: ["not_seen", "in_progress", "completed", "rejected"],
      default: "not_seen",
    },
    rejectionReason: {
      type: String,
      default: "",
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
    warningSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Certificate", CertificateSchema);
