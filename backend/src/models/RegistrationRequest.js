const mongoose = require("mongoose");

const RegistrationRequestSchema = new mongoose.Schema({
  // Section 2 fields
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  nic: { type: String, required: true, unique: true, trim: true },
  surname: { type: String, trim: true },
  initials: { type: String, trim: true },
  first_name: { type: String, trim: true },
  middle_name: { type: String, trim: true },
  last_name: { type: String, trim: true },
  full_name: { type: String, required: true, trim: true },
  date_of_birth: { type: Date, required: true },
  address: { type: String, required: true },
  village_id: { type: String, ref: "Village", required: true },
  phone_numbers: { type: [String], required: true },
  occupation: { type: String, trim: true },
  profile_picture: { type: String, required: true }, // path to image

  // Section 1
  is_family_head: { type: Boolean, required: true },
  family_reg_no: { type: String, trim: true }, // required if not head

  // Section 3
  password_hash: { type: String, required: true },

  // Metadata
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },
  verified_by: { type: mongoose.Schema.Types.ObjectId, ref: "GNOfficer" },
  verified_at: Date,
  rejection_reason: String,
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model(
  "RegistrationRequest",
  RegistrationRequestSchema,
);
