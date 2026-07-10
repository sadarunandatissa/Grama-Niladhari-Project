const express = require("express");
const router = express.Router();
const Village = require("../models/Village");

router.get("/", async (req, res) => {
  try {
    const villages = await Village.find().select("village_id name").lean();
    res.json({ success: true, data: villages });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
