const mongoose = require("mongoose");

/**
 * AuditLog - Track sensitive actions for privacy & security
 */
const AuditLogSchema = new mongoose.Schema({
  user_type: {
    type: String,
    enum: ["admin", "gn_officer", "citizen"],
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "user_model",
  },
  user_model: {
    type: String,
    enum: ["Admin", "GNOfficer", "Citizen"],
  },
  action: {
    type: String,
    required: true,
  },
  details: {
    type: Object,
    default: {},
  },
  ip_address: String,
  user_agent: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AuditLog", AuditLogSchema);
