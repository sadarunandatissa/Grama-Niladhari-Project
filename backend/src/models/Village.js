const mongoose = require("mongoose");

/**
 * Village Model - Grama Niladhari Division
 */
const VillageSchema = new mongoose.Schema({
  village_id: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  ds_division: {
    type: String,
    required: true,
    trim: true,
  },
  district: {
    type: String,
    required: true,
    trim: true,
  },
  province: {
    type: String,
    required: true,
    trim: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Corrected casing: Changed villageSchema to VillageSchema
module.exports =
  mongoose.models.Village || mongoose.model("Village", VillageSchema);
