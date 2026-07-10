const express = require("express");
const router = express.Router();
const {
  submitRegistration,
  getPendingRegistrations,
  verifyRegistration,
} = require("../controllers/registrationController");
const { protect, authorize } = require("../middleware/auth");
const { uploadCitizenPicture } = require("../middleware/upload");
const { limiter } = require("../middleware/rateLimiter");

router.post("/submit", limiter, uploadCitizenPicture, submitRegistration);
router.get(
  "/pending",
  protect,
  authorize("gn_officer"),
  getPendingRegistrations,
);
router.put("/verify/:id", protect, authorize("gn_officer"), verifyRegistration);

module.exports = router;
