const express = require("express");
const router = express.Router();
const {
  requestCertificate,
  getMyCertificates,
  getPendingCertificates,
  updateCertificateStatus,
  getCertificateDetails,
  getCitizenNotifications,
  getOfficerNotifications,
  markNotificationRead,
} = require("../controllers/certificateController");
const { protect, authorize } = require("../middleware/auth");
const { uploadCertificateDocs } = require("../middleware/upload");

// ─── Citizen routes ──────────────────────────────────────
router.post(
  "/request",
  protect,
  authorize("citizen"),
  uploadCertificateDocs,
  requestCertificate,
);
router.get("/my-requests", protect, authorize("citizen"), getMyCertificates);
router.get(
  "/citizen/notifications",
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

// ─── GN Officer routes ──────────────────────────────────
// ✅ SPECIFIC routes MUST come BEFORE the generic :id route
router.get(
  "/officer/notifications",
  protect,
  authorize("gn_officer"),
  getOfficerNotifications,
);
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

// ⚠️ GENERIC route – MUST BE LAST
router.get(
  "/officer/:id",
  protect,
  authorize("gn_officer"),
  getCertificateDetails,
);

module.exports = router;
