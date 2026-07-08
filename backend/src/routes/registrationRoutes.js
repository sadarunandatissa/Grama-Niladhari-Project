const express = require("express");
const router = express.Router();
const {
  submitRegistration,
  getPendingRegistrations,
  verifyRegistration,
} = require("../controllers/registrationController");
const { protect, authorize } = require("../middleware/auth");
const { handleUpload } = require("../middleware/upload");
const { limiter } = require("../middleware/rateLimiter");

// Public: submit registration (with rate limiting)
router.post("/submit", limiter, handleUpload, submitRegistration);

// GN Officer protected routes
router.get(
  "/pending",
  protect,
  authorize("gn_officer"),
  getPendingRegistrations,
);
router.put("/verify/:id", protect, authorize("gn_officer"), verifyRegistration);

module.exports = router;
