const mongoose = require("mongoose");

const LandSchema = new mongoose.Schema(
  {
    land_id: {
      type: String,
      unique: true,
      required: true,
    },
    village_id: {
      type: String,
      ref: "Village",
      required: true,
      index: true,
    },
    owner_nic: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    size: {
      value: {
        type: Number,
        required: true,
        min: 0.01,
      },
      unit: {
        type: String,
        enum: ["acres", "perches"],
        required: true,
      },
    },
    type: {
      type: String,
      enum: ["land", "paddy_field"],
      required: true,
    },
    owner_type: {
      type: String,
      enum: ["my_own_land", "gift_land"],
      required: true,
    },
    real_owner_nic: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },
    location_description: {
      type: String,
      trim: true,
    },
    survey_number: {
      type: String,
      trim: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GNOfficer",
      required: true,
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GNOfficer",
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// ✅ CORRECT PRE‑SAVE HOOK – Using async/await (no `next` parameter)
LandSchema.pre("save", async function () {
  if (!this.land_id) {
    // For simplicity, generate a timestamp‑based ID.
    // For sequential IDs, use a counter collection.
    const villagePrefix = this.village_id || "GN";
    const timestamp = Date.now().toString().slice(-6);
    this.land_id = `${villagePrefix}-LAND-${timestamp}`;
  }
  // No `next()` call needed for async hooks
});

module.exports = mongoose.model("Land", LandSchema);
