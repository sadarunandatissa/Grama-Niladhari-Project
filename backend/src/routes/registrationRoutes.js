const express = require("express");
const router = express.Router();

// Import controllers (make sure these exist and are exported correctly)
const {
  submitRegistration,
  getPendingRegistrations,
  verifyRegistration,
} = require("../controllers/registrationController");

// Import middleware
const { protect, authorize } = require("../middleware/auth");
const { uploadCitizenPicture } = require("../middleware/upload");
const { limiter } = require("../middleware/rateLimiter");

// Public: Submit registration (with rate limiting and file upload)
router.post("/submit", limiter, uploadCitizenPicture, submitRegistration);

// Protected: GN Officer routes
router.get(
  "/pending",
  protect,
  authorize("gn_officer"),
  getPendingRegistrations,
);
router.put("/verify/:id", protect, authorize("gn_officer"), verifyRegistration);

module.exports = router;
