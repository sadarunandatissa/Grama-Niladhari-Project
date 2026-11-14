const express = require("express");
const router = express.Router();
const {
  createGNOfficer,
  getVillages,
  getStats,
  getAllGNOfficers,
  deleteGNOfficer,
  deleteVillage,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");
const { handleUpload } = require("../middleware/upload");

router.use(protect, authorize("admin"));

// Villages
router.get("/villages", getVillages);
// ❌ Remove: router.post("/villages", createVillage);
// Villages are now created via /api/location/villages
router.delete("/villages/:id", deleteVillage);

// GN Officers
router.get("/gn-officers", getAllGNOfficers);
router.post("/gn-officer", handleUpload, createGNOfficer);
router.delete("/gn-officer/:id", deleteGNOfficer);

// Stats
router.get("/stats", getStats);

module.exports = router;
