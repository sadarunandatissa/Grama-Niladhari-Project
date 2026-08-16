const express = require("express");
const router = express.Router();
const {
  requestCertificate,
  getMyCertificates,
  getPendingCertificates,
  updateCertificateStatus,
  getCertificateDetails,
  getOfficerNotifications,
  getCitizenNotifications,
  markNotificationRead,
} = require("../controllers/certificateController");
const { protect, authorize } = require("../middleware/auth");
const { uploadCertificateDocs } = require("../middleware/upload");

// ─── Citizen routes ──────────────────────────────────
router.post(
  "/request",
  protect,
  authorize("citizen"),
  uploadCertificateDocs, // ✅ Directly use the middleware
  requestCertificate,
);

router.get("/my-requests", protect, authorize("citizen"), getMyCertificates);
router.get(
  "/notifications",
  protect,
  authorize("citizen"),
  getCitizenNotifications,
);
router.put(
  "/notification/:id",
  protect,
  authorize("citizen"),
  markNotificationRead,
);

// ─── GN Officer routes ───────────────────────────────
router.get(
  "/officer/pending",
  protect,
  authorize("gn_officer"),
  getPendingCertificates,
);
router.get(
  "/officer/:id",
  protect,
  authorize("gn_officer"),
  getCertificateDetails,
);
// GN Officer routes
router.get(
  "/officer/notifications",
  protect,
  authorize("gn_officer"),
  getOfficerNotifications,
);
router.put(
  "/officer/update/:id",
  protect,
  authorize("gn_officer"),
  updateCertificateStatus,
);

module.exports = router;
