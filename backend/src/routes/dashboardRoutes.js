const express = require("express");
const router = express.Router();
const {
  getOfficerDashboardStats,
} = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/auth");

router.get(
  "/officer/stats",
  protect,
  authorize("gn_officer"),
  getOfficerDashboardStats,
);

module.exports = router;
