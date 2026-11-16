const express = require("express");
const router = express.Router();
const Province = require("../models/Province");
const District = require("../models/District");
const DSDivision = require("../models/DSDivision");
const Village = require("../models/Village");

// Get all provinces
router.get("/provinces", async (req, res) => {
  try {
    const provinces = await Province.find().sort("name");
    res.json(provinces);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get districts by province
router.get("/districts", async (req, res) => {
  try {
    const { provinceId } = req.query;
    if (!provinceId)
      return res.status(400).json({ error: "provinceId required" });
    const districts = await District.find({ province: provinceId }).sort(
      "name",
    );
    res.json(districts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get DS divisions by district
router.get("/dsdivisions", async (req, res) => {
  try {
    const { districtId } = req.query;
    if (!districtId)
      return res.status(400).json({ error: "districtId required" });
    const dsDivisions = await DSDivision.find({ district: districtId }).sort(
      "name",
    );
    res.json(dsDivisions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get villages by DS division
router.get("/villages", async (req, res) => {
  try {
    const { dsDivisionId } = req.query;
    if (!dsDivisionId)
      return res.status(400).json({ error: "dsDivisionId required" });
    const villages = await Village.find({ dsDivision: dsDivisionId }).sort(
      "name",
    );
    res.json(villages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new village
router.post("/villages", async (req, res) => {
  try {
    const { name, dsDivisionId } = req.body;
    if (!name || !dsDivisionId) {
      return res.status(400).json({ error: "name and dsDivisionId required" });
    }
    const village = await Village.create({ name, dsDivision: dsDivisionId });
    res.status(201).json(village);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
