const mongoose = require("mongoose");

const GNOfficerSchema = new mongoose.Schema({
  village_id: {
    type: String,
    ref: "Village",
    unique: true,
    required: true,
  },
  employee_id: {
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
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("GNOfficer", GNOfficerSchema);
