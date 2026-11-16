const mongoose = require("mongoose");

const dsDivisionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "District",
    required: true,
  },
});

module.exports = mongoose.model("DSDivision", dsDivisionSchema);
