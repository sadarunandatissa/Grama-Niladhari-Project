const mongoose = require("mongoose");

const RegistrationRequestSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  nic: { type: String, required: true, unique: true },
  surname: String,
  initials: String,
  first_name: String,
  middle_name: String,
  last_name: String,
  full_name: { type: String, required: true },
  date_of_birth: { type: Date, required: true },
  address: { type: String, required: true },
  village_id: { type: String, ref: "Village", required: true },
  phone_numbers: [String],
  occupation: String,
  profile_picture: { type: String, required: true },
  is_family_head: { type: Boolean, required: true },
  family_reg_no: { type: String, trim: true },
  password_hash: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },
  verified_by: { type: mongoose.Schema.Types.ObjectId, ref: "GNOfficer" },
  verified_at: Date,
  rejection_reason: String,
  citizen_id: { type: mongoose.Schema.Types.ObjectId, ref: "Citizen" },
  family_id: { type: mongoose.Schema.Types.ObjectId, ref: "Family" },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model(
  "RegistrationRequest",
  RegistrationRequestSchema,
);
