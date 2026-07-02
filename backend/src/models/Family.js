const mongoose = require("mongoose");

const FamilySchema = new mongoose.Schema(
  {
    village_id: {
      type: String,
      ref: "Village",
      required: true,
      index: true,
    },
    family_reg_no: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    family_type: {
      type: String,
      enum: ["Nuclear", "Joint", "Extended"],
      default: "Nuclear",
    },
    head_citizen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      default: null,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    verified_at: {
      type: Date,
      default: null,
    },
    member_count: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Family", FamilySchema);
