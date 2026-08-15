const express = require("express");
const router = express.Router();
const {
  requestCertificate,
  getMyCertificates,
  getPendingCertificates,
  updateCertificateStatus,
  getCertificateDetails,
} = require("../controllers/certificateController");
const { protect, authorize } = require("../middleware/auth");

// ─── Citizen routes ──────────────────────────────────────
router.post("/request", protect, authorize("citizen"), requestCertificate);
router.get("/my-requests", protect, authorize("citizen"), getMyCertificates);

// ─── GN Officer routes ──────────────────────────────────
router.get(
  "/officer/pending",
  protect,
  authorize("gn_officer"),
  getPendingCertificates,
);
router.put(
  "/officer/update/:id",
  protect,
  authorize("gn_officer"),
  updateCertificateStatus,
);
router.get(
  "/officer/:id",
  protect,
  authorize("gn_officer"),
  getCertificateDetails,
);

module.exports = router;
