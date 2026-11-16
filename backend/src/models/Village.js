const mongoose = require("mongoose");

const villageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dsDivision: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DSDivision",
    required: true,
  },
});

module.exports = mongoose.model("Village", villageSchema);
