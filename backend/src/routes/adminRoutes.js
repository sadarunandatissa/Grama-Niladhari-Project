const express = require("express");
const router = express.Router();
const {
  createGNOfficer,
  getVillages,
  getStats,
  getAllGNOfficers,
  deleteGNOfficer,
  createVillage,
  deleteVillage,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");
const { handleUpload } = require("../middleware/upload");

router.use(protect, authorize("admin"));

router.get("/villages", getVillages);
router.post("/villages", createVillage);
router.delete("/villages/:id", deleteVillage);

router.get("/gn-officers", getAllGNOfficers);
router.post("/gn-officer", handleUpload, createGNOfficer);
router.delete("/gn-officer/:id", deleteGNOfficer);

router.get("/stats", getStats);

module.exports = router;
