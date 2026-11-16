const mongoose = require("mongoose");

const welfareSchema = new mongoose.Schema(
    {
        // Citizen who submitted the welafare request
        citizenId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Citizen",
            required: true,
        },

        // GN division of the citizen
        village_id: {
            type: String,
            required: true,
        },

        // Monthly household income
        monthlyIncome: {
            type: Number,
            required: true,
        },

        // Number of family members
        familyMembers: {
            type: Number,
            required: true,
        },

        // Reason for requesting welfare
        reason: {
            type: String,
            required: true,
            trim: true,
        },

        // Welfare application status
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },

        // GN officer's comments
        officerNotes: {
            type: String,
            default: "",
        },

        // GN officer who reviewed the application
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GNOfficer",
            default: null,
        },

        // Date of approval or rejection
        reviewedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        collection: "welfare_requests",
    }
);

module.exports = mongoose.model("Welfare", welfareSchema);