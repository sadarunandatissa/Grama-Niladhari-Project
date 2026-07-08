const mongoose = require("mongoose");

/**
 * Citizen Model - Registered resident
 */
const CitizenSchema = new mongoose.Schema({
  // Login credentials
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password_hash: {
    type: String,
    required: true,
  },

  // Personal details
  nic: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  full_name: {
    type: String,
    required: true,
    trim: true,
  },
  initials: String,
  surname: String,
  first_name: String,
  middle_name: String,
  last_name: String,
  date_of_birth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone_numbers: {
    type: [String],
    required: true,
  },
  occupation: String,

  // Village & Family
  village_id: {
    type: String,
    ref: "Village",
    required: true,
    index: true,
  },
  family_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Family",
    default: null,
  },

  // Profile picture
  profile_picture: {
    type: String,
    default: null,
  },

  // Family head info
  is_head: {
    type: Boolean,
    default: false,
  },
  relationship_to_head: {
    type: String,
    enum: [
      "Self",
      "Spouse",
      "Son",
      "Daughter",
      "Father",
      "Mother",
      "Sibling",
      "Grandparent",
      "Other",
    ],
    default: "Other",
  },

  // Verification
  is_verified: {
    type: Boolean,
    default: false,
  },
  verified_at: Date,
  verified_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GNOfficer",
    default: null,
  },

  // Status
  is_active: {
    type: Boolean,
    default: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Citizen", CitizenSchema);
