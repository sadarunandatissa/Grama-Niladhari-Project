const mongoose = require("mongoose");

const FamilySchema = new mongoose.Schema({
  village_id: { type: String, ref: "Village", required: true },
  family_reg_no: { type: String, required: true, unique: true },
  head_citizen_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Citizen",
    default: null,
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Citizen" }],
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Family", FamilySchema);
