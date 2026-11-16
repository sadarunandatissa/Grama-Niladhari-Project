const Welfare = require("../models/Welfare");
const Citizen = require("../models/Citizen");
const GNOfficer = require("../models/GNOfficer");

// Citizen: Submit a welfare request
exports.submitWelfareRequest = async (req, res) => {
    try {
        const { monthlyIncome, familyMembers, reason } = req.body;
        const citizenId = req.user.id;

        // Check whether the citizen exists
        const citizen = await Citizen.findById(citizenId);

        if (!citizen) {
            return res.status(404).json({
                success: false,
                message: "Citizen not found",
            });
        }

        // Validate form fields
        if (
            monthlyIncome === undefined ||
            familyMembers === undefined ||
            !reason
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields.",
            });
        }

        if (
            !Number.isFinite(Number(monthlyIncome)) ||
            Number(monthlyIncome) < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Monthly income must be a valid non-negative number.",
            });
        }

        if (
            !Number.isInteger(Number(familyMembers)) ||
            Number(familyMembers) < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Family members must be at least 1.",
            });
        }

        // Prevent duplicate welfare requests
        const existingRequest = await Welfare.findOne({ citizenId });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: "You have already submitted a welfare request.",
            });
        }

        // Create the welfare request
        const welfare = await Welfare.create({
            citizenId: citizen._id,
            village_id: citizen.village_id,
            monthlyIncome: Number(monthlyIncome),
            familyMembers: Number(familyMembers),
            reason: reason.trim(),
        });

        return res.status(201).json({
            success: true,
            message: "Welfare request submitted successFully.",
            data: welfare,
        });
    } catch (error) {
        console.error("Submit welfare request error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
};

// Citizen: View own welfare status
exports.getMyWelfareStatus = async (req, res) => {
    try {
        const welfare = await Welfare.findOne({
            citizenId: req.user.id,
        });

        return res.json({
            success: true,
            data: welfare,
        });
    } catch (error) {
        console.error("Get welfare status error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
};

// GN Officer: View welfare requests in own village
exports.getVillageWelfareRequests = async (req, res) => {
    try {
        const officer = await GNOfficer.findById(req.user.id);

        if (!officer) {
            return res.status(404).json({
                success: false,
                message: "GN Officer not found",
            });
        }

        // Only retrieve requests from this officer's village
        const filter = {
            village_id: officer.village_id,
        };

        // Status filter
        const { status } = req.query;

        if (status && status !== "all") {
            if (!["pending", "approved", "rejected"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid welfare status.",
                });
            }

            filter.status = status;
        }

        const requests = await Welfare.find(filter).populate(
            "citizenId",
            "full_name nic address phone_numbers"
        )
        .sort({ createdAt: -1 });

        return res.json({
            success: true,
            data: requests,
        });
    } catch (error) {
        console.error("Get village welfare requests error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
};

// GN Officer: Approve or reject a welfare request
exports.updateWelfareStatus = async (req, res) => {
    try {
        const { status, officerNotes } = req.body;

        // Only allow these two review decisions
        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be approved or rejected.",
            });
        }

        const officer = await GNOfficer.findById(req.user.id);

        if (!officer) {
            return res.status(404).json({
                success: false,
                message: "GN Officer not found",
            });
        }

        // Find the request only if it belongs to this officer's village
        const welfare = await Welfare.findOne({
            _id: req.params.id,
            village_id: officer.village_id,
        });

        if (!welfare) {
            return res.status(404).json({
                success: false,
                message: "Welfare request not found in your village.",
            });
        }

        welfare.status = status;
        welfare.officerNotes = officerNotes || "";
        welfare.reviewedBy = officer._id;
        welfare.reviewdAt = new Date();

        await welfare.save();

        return res.json({
            success: true,
            message: `Welfare request ${status} successfully.`,
            data: welfare,
        });
    } catch (error) {
        console.error("Update welfare status error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
};