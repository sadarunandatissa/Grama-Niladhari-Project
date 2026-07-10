const mongoose = require("mongoose");

const CitizenSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password_hash: { type: String, required: true },
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
  family_id: { type: mongoose.Schema.Types.ObjectId, ref: "Family" },
  is_head: { type: Boolean, default: false },
  is_verified: { type: Boolean, default: false },
  verified_at: Date,
  verified_by: { type: mongoose.Schema.Types.ObjectId, ref: "GNOfficer" },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Citizen", CitizenSchema);
