const mongoose = require("mongoose");

const LandSchema = new mongoose.Schema(
  {
    // Auto-generated land ID (e.g., GN-001-LAND-001)
    land_id: {
      type: String,
      unique: true,
      required: true,
    },
    // Village where the land is located
    village_id: {
      type: String,
      ref: "Village",
      required: true,
      index: true,
    },
    // Owner NIC (must be a registered citizen)
    owner_nic: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    // Land size and unit
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
    // Type of land
    type: {
      type: String,
      enum: ["land", "paddy_field"],
      required: true,
    },
    // Ownership type
    owner_type: {
      type: String,
      enum: ["my_own_land", "gift_land"],
      required: true,
    },
    // If gift_land, store the real owner's NIC
    real_owner_nic: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },
    // Additional details
    location_description: {
      type: String,
      trim: true,
    },
    survey_number: {
      type: String,
      trim: true,
    },
    // Audit
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

// Generate land_id before saving
LandSchema.pre("save", function (next) {
  if (!this.land_id) {
    // Get the village prefix (first 3 chars of village_id or use village_id itself)
    const villagePrefix = this.village_id || "GN";
    // Count existing lands to generate sequence
    // We'll use a separate counter or query to get the next number
    // For now, we'll generate a timestamp-based ID
    const timestamp = Date.now().toString().slice(-6);
    this.land_id = `${villagePrefix}-LAND-${timestamp}`;
  }
  next();
});

module.exports = mongoose.model("Land", LandSchema);
