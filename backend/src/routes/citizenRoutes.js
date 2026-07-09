const express = require("express");
const router = express.Router();
const { getProfile, getRequests } = require("../controllers/citizenController");
const { protect, authorize } = require("../middleware/auth");

// All citizen routes require authentication and citizen role
router.use(protect, authorize("citizen"));

router.get("/profile", getProfile);
router.get("/requests", getRequests);

module.exports = router;
