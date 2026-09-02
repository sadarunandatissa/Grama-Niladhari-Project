const express = require("express");
const router = express.Router();
const {
  submitPermit,
  getMyPermits,
  getVillagePermits,
  updatePermitStatus,
  getPermitDetails,
} = require("../controllers/permitController");
const { protect, authorize } = require("../middleware/auth");

// ─── Citizen routes ──────────────────────────────────────
router.post("/citizen", protect, authorize("citizen"), submitPermit);
router.get("/citizen/my", protect, authorize("citizen"), getMyPermits);

// ─── GN Officer routes ──────────────────────────────────
router.get("/officer", protect, authorize("gn_officer"), getVillagePermits);
router.get("/officer/:id", protect, authorize("gn_officer"), getPermitDetails);
router.put(
  "/officer/:id",
  protect,
  authorize("gn_officer"),
  updatePermitStatus,
);

module.exports = router;
