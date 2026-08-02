const express = require(`express`);
const router = express.Router;

const {
  submitRequest,
  getMyRequests,
  getPendingRequests,
  getAllRequests,
  updatestatus,
  getRequestDetails,
  getNotifications,
  markNotificationRead,
} = require("../controllers/certificateController");
const { protect, authorize } = require("../middleware/auth");
const { uploadCertificateDocuments } = require("../middleware/upload");

// Citizen Routes
router.use("/citizen", protect, authorize("citizen"));
router.post(
  "/citizen/request",
  uploadCertificateDocuments.array("documents", 5),
  submitRequest,
);
router.get("/citizen/my-requests", getMyRequests);
router.get("/citizen/request/:id", getRequestDetails);
router.get("/citizen/notifications", getNotifications);
router.put("/citizen/notification/:id", markNotificationRead);

// GN Officer Routes
router.use("/officer", protect, authorize("gn_officer"));
router.get("/officer/pending", getPendingRequests);
router.get("/officer/all", getAllRequests);
router.get("/officer/request/:id", getRequestDetails);
router.put("/officer/upload/:id", updatestatus);

module.exports = router;
