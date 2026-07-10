const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
} = require("../controllers/gnOfficerController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("gn_officer"));
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

module.exports = router;
