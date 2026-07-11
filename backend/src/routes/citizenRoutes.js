const express = require("express");
const router = express.Router();
const {
  getProfile,
  getRequests,
  createFamily,
} = require("../controllers/citizenController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("citizen"));
router.get("/profile", getProfile);
router.get("/requests", getRequests);
router.post("/family", createFamily);

module.exports = router;
