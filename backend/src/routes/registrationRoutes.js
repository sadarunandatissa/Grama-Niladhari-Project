// backend/src/routes/registrationRoutes.js
const express = require("express");
const { submitRegistration } = require("../controllers/registrationController");
const { uploadCitizenPicture } = require("../middleware/upload");
const { limiter } = require("../middleware/rateLimiter");
const express = require("express");
const router = express.Router();
// Public: submit registration with image and rate limiting
router.post("/submit", limiter, uploadCitizenPicture, submitRegistration);

// Import controllers
const {
  submitRegistration,
  getPendingRegistrations,
  verifyRegistration,
} = require("../controllers/registrationController");

// Import middleware
const { protect, authorize } = require("../middleware/auth");
const { handleUpload } = require("../middleware/upload");
const { limiter } = require("../middleware/rateLimiter");

// Public route: submit registration (with rate limiting + file upload)
router.post("/submit", limiter, handleUpload, submitRegistration);

// Protected routes (GN Officer only)
router.get(
  "/pending",
  protect,
  authorize("gn_officer"),
  getPendingRegistrations,
);
router.put("/verify/:id", protect, authorize("gn_officer"), verifyRegistration);

module.exports = router;
