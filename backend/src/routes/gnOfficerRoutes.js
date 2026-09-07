const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getVillageResidents,
  getResidentDetails,
} = require("../controllers/gnOfficerController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("gn_officer"));
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/residents", getVillageResidents);
router.get("/residents/:id", getResidentDetails);

module.exports = router;
