const express = require("express");
const router = express.Router();
const {
  createGNOfficer,
  getVillages,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");
const { handleUpload } = require("../middleware/upload");

router.use(protect, authorize("admin"));
router.get("/villages", getVillages);
router.post("/gn-officer", handleUpload, createGNOfficer);

module.exports = router; // ✅ must be present
