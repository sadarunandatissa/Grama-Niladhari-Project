const express = require("express");
const router = express.Router();
const {
  createLand,
  getLands,
  getLandById,
  updateLand,
  deleteLand,
  getLandStats,
} = require("../controllers/landController");
const { protect, authorize } = require("../middleware/auth");

// All routes require GN Officer authentication
router.use(protect, authorize("gn_officer"));

// CRUD
router.post("/", createLand);
router.get("/", getLands);
router.get("/stats", getLandStats);
router.get("/:id", getLandById);
router.put("/:id", updateLand);
router.delete("/:id", deleteLand);

module.exports = router;
