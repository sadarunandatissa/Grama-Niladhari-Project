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
const RegistrationRequest = require("../models/RegistrationRequest");
const Appointment = require("../models/Appointment");

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

const createStatusCounts = () => ({
  pending: 0,
  approved: 0,
  rejected: 0,
});

const getStatusGroup = (status, pendingStatuses, approvedStatus) => {
  if (pendingStatuses.includes(status)) return "pending";
  if (status === approvedStatus) return "approved";
  if (status === "rejected") return "rejected";
  return null;
};

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

    const certCounts = createStatusCounts();
    const certMonthly = {
      pending: new Array(12).fill(0),
      approved: new Array(12).fill(0),
      rejected: new Array(12).fill(0),
    };

    allCertificates.forEach((c) => {
      const statusGroup = getStatusGroup(
        c.status,
        CERT_PENDING_STATUSES,
        "completed",
      );
      if (!statusGroup) return;
      certCounts[statusGroup] += 1;

      const d = new Date(c.requestedAt);
      if (!Number.isNaN(d.getTime()) && d >= yearStart && d < yearEnd) {
        certMonthly[statusGroup][d.getMonth()] += 1;
      }
    });

    // ── Permits ────────────────────────────────────────────
    const allPermits = await Permit.find({
      village_id: villageId,
    }).select("status requestedAt permitType citizenId");

    const permitCounts = createStatusCounts();
    const permitMonthly = {
      pending: new Array(12).fill(0),
      approved: new Array(12).fill(0),
      rejected: new Array(12).fill(0),
    };

    allPermits.forEach((p) => {
      const statusGroup = getStatusGroup(
        p.status,
        PERMIT_PENDING_STATUSES,
        "accepted",
      );
      if (!statusGroup) return;
      permitCounts[statusGroup] += 1;

      const d = new Date(p.requestedAt);
      if (!Number.isNaN(d.getTime()) && d >= yearStart && d < yearEnd) {
        permitMonthly[statusGroup][d.getMonth()] += 1;
      }
    });

    // ── Village totals ─────────────────────────────────────
    const activeCitizensFilter = { village_id: villageId, is_active: true };
    const [
      totalCitizens,
      totalFamilies,
      maleCitizens,
      femaleCitizens,
      pendingRegistrations,
      pendingAppointments,
    ] = await Promise.all([
      Citizen.countDocuments(activeCitizensFilter),
      Family.countDocuments({ village_id: villageId }),
      Citizen.countDocuments({ ...activeCitizensFilter, gender: "male" }),
      Citizen.countDocuments({ ...activeCitizensFilter, gender: "female" }),
      RegistrationRequest.countDocuments({
        village_id: villageId,
        status: "pending",
      }),
      Appointment.countDocuments({ village_id: villageId, status: "pending" }),
    ]);

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
          ...certCounts,
          monthly: certMonthly,
          recent: recentCertificates.map((c) => ({
            id: c._id,
            label: `${c.certificateType} certificate - ${c.citizenId?.full_name || "Unknown"}`,
            status: c.status,
          })),
        },
        permits: {
          ...permitCounts,
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
        },
        genderStats: { male: maleCitizens, female: femaleCitizens },
        pendingRegistrations,
        pendingAppointments,
      },
    });
  } catch (error) {
    console.error("Get officer dashboard stats error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
