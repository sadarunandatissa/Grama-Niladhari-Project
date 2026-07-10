const mongoose = require("mongoose");

const GNOfficerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password_hash: { type: String, required: true },
  full_name: { type: String, required: true },
  phone: { type: String, required: true },
  village_id: { type: String, ref: "Village", required: true, unique: true },
  profile_picture: { type: String, default: null },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("GNOfficer", GNOfficerSchema);
