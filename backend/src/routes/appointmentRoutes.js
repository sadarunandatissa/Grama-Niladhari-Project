const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  getVillageAppointments,
  updateAppointment,
} = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/auth");

// ─── Citizen routes ──────────────────────────────────────
router.post("/citizen", protect, authorize("citizen"), createAppointment);
router.get("/citizen/my", protect, authorize("citizen"), getMyAppointments);

// ─── GN Officer routes ──────────────────────────────────
router.get(
  "/officer",
  protect,
  authorize("gn_officer"),
  getVillageAppointments,
);
router.put("/officer/:id", protect, authorize("gn_officer"), updateAppointment);

module.exports = router;
