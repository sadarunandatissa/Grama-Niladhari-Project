const mongoose = require("mongoose");

const VillageSchema = new mongoose.Schema({
  village_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  ds_division: { type: String, required: true },
  district: { type: String, required: true },
  province: { type: String, required: true },
});

module.exports = mongoose.model("Village", VillageSchema);
