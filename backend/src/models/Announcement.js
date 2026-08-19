const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    priority: {
      type: String,
      enum: ["Normal", "Important", "Urgent", "Emergency"],
      default: "Normal",
    },
    targetAudience: {
      type: String,
      enum: ["all", "specific"],
      required: true,
      default: "all",
    },
    specificNICs: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          if (this.targetAudience === "specific" && v.length === 0) {
            return false;
          }
          return true;
        },
        message: "At least one NIC required when targeting specific citizens.",
      },
    },
    publishMode: {
      type: String,
      enum: ["immediate", "scheduled"],
      required: true,
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    attachments: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "published", "scheduled", "expired"],
      default: "draft",
    },
    sentAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GNOfficer",
      required: true,
    },
    village_id: {
      type: String,
      ref: "Village",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

// Ensure scheduledAt is set if publishMode = scheduled
AnnouncementSchema.pre("save", function (next) {
  if (this.publishMode === "scheduled" && !this.scheduledAt) {
    return next(
      new Error("Scheduled date is required for scheduled announcements."),
    );
  }
  if (this.publishMode === "immediate") {
    this.scheduledAt = null;
  }
  next();
});

module.exports = mongoose.model("Announcement", AnnouncementSchema);
