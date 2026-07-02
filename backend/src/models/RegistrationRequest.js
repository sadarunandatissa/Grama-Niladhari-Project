const mongoose = require("mongoose");

const RegistrationRequestSchema = new mongoose.Schema({
  // Personal Details
  nic: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  full_name: {
    type: String,
    required: true,
    trim: true,
  },
  initials: {
    type: String,
    trim: true,
  },
  surname: {
    type: String,
    trim: true,
  },
  first_name: {
    type: String,
    trim: true,
  },
  middle_name: {
    type: String,
    trim: true,
  },
  last_name: {
    type: String,
    trim: true,
  },
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
    trim: true,
  },
  village: {
    type: String,
    required: true,
    trim: true,
  },
  phone_numbers: {
    type: [String],
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  occupation: {
    type: String,
    trim: true,
  },

  // Family Information
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
        if (!this.is_family_head && !value) {
          return false;
        }
        return true;
      },
      message: "Family registration number is required for non-head members",
    },
  },

  // Login Credentials
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    minlength: 3,
  },
  password_hash: {
    type: String,
    required: true,
  },

  // Status & Verification
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },
  village_id: {
    type: String,
    ref: "Village",
    default: null,
  },
  verified_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GNOfficer",
    default: null,
  },
  verified_at: {
    type: Date,
    default: null,
  },
  rejection_reason: {
    type: String,
    default: null,
  },

  // References after verification
  family_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Family",
    default: null,
  },
  citizen_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Citizen",
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
