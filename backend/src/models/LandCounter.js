const mongoose = require("mongoose");

const LandCounterSchema = new mongoose.Schema({
  village_id: {
    type: String,
    required: true,
    unique: true,
  },
  sequence: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("LandCounter", LandCounterSchema);
