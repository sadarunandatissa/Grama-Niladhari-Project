const express = require("express");
const router = express.Router();
const {
  createAnnouncement,
  getOfficerAnnouncements,
  getResidentAnnouncements,
  getAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");
const { protect, authorize } = require("../middleware/auth");
const { uploadAnnouncementAttachments } = require("../middleware/upload");

// ─── GN Officer routes ──────────────────────────────────
router.post(
  "/officer",
  protect,
  authorize("gn_officer"),
  uploadAnnouncementAttachments.array("attachments", 5),
  createAnnouncement,
);
router.get(
  "/officer",
  protect,
  authorize("gn_officer"),
  getOfficerAnnouncements,
);
router.delete("/:id", protect, authorize("gn_officer"), deleteAnnouncement);

// ─── Resident routes ────────────────────────────────────
router.get(
  "/resident",
  protect,
  authorize("citizen"),
  getResidentAnnouncements,
);

// ─── Common (both roles can view) ──────────────────────
router.get("/:id", protect, getAnnouncement);

module.exports = router;
