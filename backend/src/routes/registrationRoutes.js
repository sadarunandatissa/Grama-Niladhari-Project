const express = require("express");
const router = express.Router();
const {
  submitRegistration,
  getPendingRegistrations,
  getAllRegistrations,
  verifyRegistration,
  getRegistrationStats,
} = require("../controllers/registrationController");
const { protect, authorize } = require("../middleware/auth");

// Public: Submit registration
router.post("/submit", submitRegistration);

// Protected: GN Officer routes
router.get(
  "/pending",
  protect,
  authorize("gn_officer"),
  getPendingRegistrations,
);
router.get("/all", protect, authorize("gn_officer"), getAllRegistrations);
router.get("/stats", protect, authorize("gn_officer"), getRegistrationStats);
router.put(
  "/verify/:registration_id",
  protect,
  authorize("gn_officer"),
  verifyRegistration,
);

module.exports = router;
