const mongoose = require("mongoose");

const provinceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("Province", provinceSchema);
