// backend/src/routes/registrationRoutes.js

const express = require("express");
const router = express.Router();

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
