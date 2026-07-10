const express = require("express");
const router = express.Router();
const {
  submitRegistration,
  getPendingRegistrations,
  verifyRegistration,
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
router.put(
  "/verify/:registration_id",
  protect,
  authorize("gn_officer"),
  verifyRegistration,
);

module.exports = router;
