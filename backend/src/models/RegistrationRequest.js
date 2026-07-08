const mongoose = require("mongoose");

/**
 * RegistrationRequest - Pending citizen registration awaiting GN Officer verification
 */
const RegistrationRequestSchema = new mongoose.Schema({
  // All citizen fields except password_hash (will be moved to Citizen on verification)
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

  // Village (dropdown from existing villages)
  village_id: {
    type: String,
    ref: "Village",
    required: true,
    index: true,
  },

  // Profile picture (uploaded file path)
  profile_picture: {
    type: String,
    required: true, // image is mandatory
  },

  // Family information
  is_family_head: {
    type: Boolean,
    required: true,
    default: false,
  },
  family_reg_no: {
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        if (!this.is_family_head && !value) return false;
        return true;
      },
      message: "Family registration number required for non-head members",
    },
  },

  // Status and verification
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },
  verified_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GNOfficer",
    default: null,
  },
  verified_at: Date,
  rejection_reason: String,

  // References after verification
  citizen_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Citizen",
    default: null,
  },
  family_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Family",
    default: null,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "RegistrationRequest",
  RegistrationRequestSchema,
);
