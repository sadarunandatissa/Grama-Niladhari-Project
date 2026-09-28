// backend/src/controllers/dashboardController.js
//
// New controller — none of your existing controllers return everything the
// Officer Dashboard needs in one shot (approved/rejected counts, monthly
// trend, citizen/family/house totals), so this adds one aggregating
// endpoint instead of touching your existing certificate/permit logic.

const Certificate = require("../models/Certificate");
const Permit = require("../models/Permit");
const Citizen = require("../models/Citizen");
const Family = require("../models/Family");
const GNOfficer = require("../models/GNOfficer");

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Certificate statuses in your schema: not_seen, in_progress, completed, rejected
const CERT_PENDING_STATUSES = ["not_seen", "in_progress"];
// Permit statuses in your schema: not_seen, in_progress, accepted, rejected
const PERMIT_PENDING_STATUSES = ["not_seen", "in_progress"];

// ─── GN Officer: Dashboard Stats ───────────────────────────
exports.getOfficerDashboardStats = async (req, res) => {
  try {
    const officerId = req.user.id;
    const officer = await GNOfficer.findById(officerId);
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });
    }
    const villageId = officer.village_id;

    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const yearEnd = new Date(new Date().getFullYear() + 1, 0, 1);

    // ── Certificates ──────────────────────────────────────
    const allCertificates = await Certificate.find({
      village_id: villageId,
    }).select("status requestedAt certificateType citizenId");

    let certPending = 0;
    let certApproved = 0;
    let certRejected = 0;
    const certMonthly = new Array(12).fill(0);

    allCertificates.forEach((c) => {
      if (CERT_PENDING_STATUSES.includes(c.status)) certPending += 1;
      else if (c.status === "completed") certApproved += 1;
      else if (c.status === "rejected") certRejected += 1;

      const d = new Date(c.requestedAt);
      if (d >= yearStart && d < yearEnd) {
        certMonthly[d.getMonth()] += 1;
      }
    });

    // ── Permits ────────────────────────────────────────────
    const allPermits = await Permit.find({
      village_id: villageId,
    }).select("status requestedAt permitType citizenId");

    let permitPending = 0;
    let permitApproved = 0;
    let permitRejected = 0;
    const permitMonthly = new Array(12).fill(0);

    allPermits.forEach((p) => {
      if (PERMIT_PENDING_STATUSES.includes(p.status)) permitPending += 1;
      else if (p.status === "accepted") permitApproved += 1;
      else if (p.status === "rejected") permitRejected += 1;

      const d = new Date(p.requestedAt);
      if (d >= yearStart && d < yearEnd) {
        permitMonthly[d.getMonth()] += 1;
      }
    });

    // ── Citizens / Families / Houses ───────────────────────
    const totalCitizens = await Citizen.countDocuments({
      village_id: villageId,
      is_active: true,
    });
    const totalFamilies = await Family.countDocuments({
      village_id: villageId,
    });

    // No dedicated House model in what you shared — approximated here as
    // the number of distinct addresses among active citizens in the
    // village. Swap this out if you have (or add) a real House model.
    const addresses = await Citizen.distinct("address", {
      village_id: villageId,
      is_active: true,
    });
    const totalHouses = addresses.filter(Boolean).length;

    // ── Recent activity (latest 2 certs + 2 permits) ───────
    const recentCertificates = await Certificate.find({ village_id: villageId })
      .sort({ requestedAt: -1 })
      .limit(2)
      .populate("citizenId", "full_name");

    const recentPermits = await Permit.find({ village_id: villageId })
      .sort({ requestedAt: -1 })
      .limit(2)
      .populate("citizenId", "full_name");

    res.json({
      success: true,
      data: {
        monthLabels: MONTH_LABELS,
        certificates: {
          pending: certPending,
          approved: certApproved,
          rejected: certRejected,
          monthly: certMonthly,
          recent: recentCertificates.map((c) => ({
            id: c._id,
            label: `${c.certificateType} certificate - ${c.citizenId?.full_name || "Unknown"}`,
            status: c.status,
          })),
        },
        permits: {
          pending: permitPending,
          approved: permitApproved,
          rejected: permitRejected,
          monthly: permitMonthly,
          recent: recentPermits.map((p) => ({
            id: p._id,
            label: `${p.permitType} permit - ${p.citizenId?.full_name || "Unknown"}`,
            status: p.status,
          })),
        },
        citizenStats: {
          totalCitizens,
          totalFamilies,
          totalHouses,
        },
      },
    });
  } catch (error) {
    console.error("Get officer dashboard stats error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
