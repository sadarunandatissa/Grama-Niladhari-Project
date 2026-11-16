const express = require("express");
const router = express.Router();

const {
    submitWelfareRequest,
    getMyWelfareStatus,
    getVillageWelfareRequests,
    updateWelfareStatus,
} = require("../controllers/welfareController");

const { protect, authorize } = require("../middleware/auth");

// Citizen routes
// Submit a welfare request
router.post(
    "/citizen",
    protect,
    authorize("citizen"),
    submitWelfareRequest
);

// View own welfare status
router.get(
    "/citizen/my",
    protect,
    authorize("citizen"),
    getMyWelfareStatus
);

// GN Officer routes
// View welfare requests from own village
router.get(
    "/officer",
    protect,
    authorize("gn_officer"),
    getVillageWelfareRequests
);

// Approve or reject a welfare request
router.put(
    "/officer/:id",
    protect,
    authorize("gn_officer"),
    updateWelfareStatus
);

module.exports = router;