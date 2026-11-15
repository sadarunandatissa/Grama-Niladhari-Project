import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./OfficerDashboard.css";
import BarChart from "../components/gn-officer/BarChart";
import DonutChart from "../components/gn-officer/DonutChart";
import {
  LayoutDashboard,
  CircleUserRound,
  FileCheckCorner,
  FileStack,
  UsersRound,
  Plus,
  Megaphone,
  MessageSquare,
  Bell,
  ChevronRight,
} from "lucide-react";

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

const createMonthlyCounts = () => ({
  pending: new Array(12).fill(0),
  approved: new Array(12).fill(0),
  rejected: new Array(12).fill(0),
});

const emptyStats = {
  certificates: {
    pending: 0,
    approved: 0,
    rejected: 0,
    monthly: createMonthlyCounts(),
    recent: [],
  },
  permits: {
    pending: 0,
    approved: 0,
    rejected: 0,
    monthly: createMonthlyCounts(),
    recent: [],
  },
  citizenStats: { totalCitizens: 0, totalFamilies: 0 },
  genderStats: { male: 0, female: 0 },
  pendingRegistrations: 0,
  pendingAppointments: 0,
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const OfficerDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [stats, setStats] = useState(emptyStats);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("certificates");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/dashboard/officer/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.data) setStats(res.data.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token, API_URL]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/certificate/officer/notifications`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setNotifications(res.data?.data || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, [token, API_URL]);

  if (loading) {
    return <div className="loading-spinner">Loading dashboard...</div>;
  }

  const {
    certificates,
    permits,
    citizenStats,
    genderStats,
    pendingRegistrations,
    pendingAppointments,
  } = stats;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const activeData = activeTab === "certificates" ? certificates : permits;
  const activeColor = activeTab === "certificates" ? "#2563eb" : "#16a34a";
  const activeTotal =
    activeData.pending + activeData.approved + activeData.rejected;

  const genderTotal = genderStats.male + genderStats.female;
  const genderPercentage = (value) =>
    genderTotal ? Math.round((value / genderTotal) * 100) : 0;
  const monthlySeries = [
    {
      name: "Certificates pending",
      color: "#f59e0b",
      data: certificates.monthly.pending,
    },
    {
      name: "Certificates approved",
      color: "#2563eb",
      data: certificates.monthly.approved,
    },
    {
      name: "Certificates rejected",
      color: "#dc2626",
      data: certificates.monthly.rejected,
    },
    {
      name: "Permits pending",
      color: "#fb923c",
      data: permits.monthly.pending,
    },
    {
      name: "Permits approved",
      color: "#16a34a",
      data: permits.monthly.approved,
    },
    {
      name: "Permits rejected",
      color: "#991b1b",
      data: permits.monthly.rejected,
    },
  ];

  const quickActions = [
    {
      label: "Requests",
      icon: <Plus />,
      color: "#2563eb",
      bg: "#eaf1ff",
      onClick: () => navigate("/pending-verification"),
    },
    {
      label: "Citizens",
      icon: <UsersRound />,
      color: "#16a34a",
      bg: "#eafaf0",
      onClick: () => navigate("/officer/residents"),
    },
    {
      label: "Announcements",
      icon: <Megaphone />,
      color: "#f97316",
      bg: "#fff6ea",
      onClick: () => navigate("/officer/announcements"),
    },
    {
      label: "Messages",
      icon: <MessageSquare />,
      color: "#7c3aed",
      bg: "#f3ecff",
      onClick: null,
    },
  ];

  return (
    <>
      <header className="topbar">
        <div className="page-title">
          <LayoutDashboard /> Dashboard
        </div>
        <div className="topbar-right">
          <div className="topbar-greeting">
            <span className="greeting-line">
              {getGreeting()}, {user?.name || "GN Officer"}
            </span>
            <span className="greeting-sub">
              GN Division {user?.village_id || "N/A"} &middot;{" "}
              {new Date().toLocaleDateString()}
            </span>
          </div>
          <div className="profile-avatar">
            <CircleUserRound />
          </div>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* KPI strip */}
        <div className="kpi-strip">
          <div className="kpi-card" style={{ "--kpi-color": "#2563eb" }}>
            <FileCheckCorner />
            <div>
              <strong>{certificates.pending}</strong>
              <span>Pending Certificates</span>
            </div>
          </div>
          <div className="kpi-card" style={{ "--kpi-color": "#16a34a" }}>
            <FileStack />
            <div>
              <strong>{permits.pending}</strong>
              <span>Pending Permits</span>
            </div>
          </div>
          <div className="kpi-card" style={{ "--kpi-color": "#f97316" }}>
            <Plus />
            <div>
              <strong>{pendingRegistrations}</strong>
              <span>Pending Registrations</span>
            </div>
          </div>
          <div className="kpi-card" style={{ "--kpi-color": "#7c3aed" }}>
            <Bell />
            <div>
              <strong>{pendingAppointments}</strong>
              <span>Pending Appointments</span>
            </div>
          </div>
          <div className="kpi-card" style={{ "--kpi-color": "#f97316" }}>
            <UsersRound />
            <div>
              <strong>{citizenStats.totalCitizens}</strong>
              <span>Total Citizens</span>
            </div>
          </div>
          <div className="kpi-card" style={{ "--kpi-color": "#2563eb" }}>
            <UsersRound />
            <div>
              <strong>{citizenStats.totalFamilies}</strong>
              <span>Total Families</span>
            </div>
          </div>
        </div>

        {/* Two column content */}
        <div className="content-columns">
          {/* Main column */}
          <div className="main-column">
            <div className="panel">
              <div className="panel-header">
                <div className="tab-switch">
                  <button
                    className={`tab-btn ${activeTab === "certificates" ? "active" : ""}`}
                    onClick={() => setActiveTab("certificates")}
                  >
                    Certificates
                  </button>
                  <button
                    className={`tab-btn ${activeTab === "permits" ? "active" : ""}`}
                    onClick={() => setActiveTab("permits")}
                  >
                    Permits
                  </button>
                </div>
                <span className="panel-total" style={{ color: activeColor }}>
                  {activeTotal} total
                </span>
              </div>

              <div className="chip-row">
                <div className="chip" style={{ "--chip-color": "#f97316" }}>
                  <span>Pending</span>
                  <strong>{activeData.pending}</strong>
                </div>
                <div className="chip" style={{ "--chip-color": "#16a34a" }}>
                  <span>Approved</span>
                  <strong>{activeData.approved}</strong>
                </div>
                <div className="chip" style={{ "--chip-color": "#dc2626" }}>
                  <span>Rejected</span>
                  <strong>{activeData.rejected}</strong>
                </div>
              </div>

              <div className="recent-list">
                {activeData.recent.length === 0 && (
                  <div className="recent-row empty">No recent requests</div>
                )}
                {activeData.recent.map((r) => (
                  <div className="recent-row" key={r.id}>
                    <span>{r.label}</span>
                    <span className={`status-pill status-${r.status}`}>
                      {r.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h5>Monthly Requests by Status</h5>
                <span className="panel-note">
                  {new Date().getFullYear()}
                </span>
              </div>
              <div className="monthly-chart-legend">
                {monthlySeries.map((series) => (
                  <span className="monthly-legend-item" key={series.name}>
                    <span
                      className="dot"
                      style={{ background: series.color }}
                    />
                    {series.name}
                  </span>
                ))}
              </div>
              <BarChart
                labels={MONTH_LABELS}
                series={monthlySeries}
              />
            </div>
          </div>

          {/* Side column */}
          <div className="side-column">
            <div className="panel">
              <div className="panel-header">
                <h5>Village Population by Gender</h5>
              </div>
              <div className="donut-row">
                <DonutChart
                  size={120}
                  strokeWidth={20}
                  centerLabel="Citizens"
                  segments={[
                    {
                      label: "Male",
                      value: genderStats.male,
                      color: "#2563eb",
                    },
                    {
                      label: "Female",
                      value: genderStats.female,
                      color: "#e879f9",
                    },
                  ]}
                />
                <div className="donut-legend">
                  <div className="legend-row">
                    <span className="dot" style={{ background: "#2563eb" }} />
                    Male <strong>{genderPercentage(genderStats.male)}%</strong>
                  </div>
                  <div className="legend-row">
                    <span className="dot" style={{ background: "#e879f9" }} />
                    Female{" "}
                    <strong>{genderPercentage(genderStats.female)}%</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h5>Quick Actions</h5>
              </div>
              <div className="quick-action-list">
                {quickActions.map((a) => (
                  <button
                    key={a.label}
                    className="quick-action-row"
                    style={{ "--qa-color": a.color, "--qa-bg": a.bg }}
                    onClick={a.onClick || undefined}
                    disabled={!a.onClick}
                  >
                    <span className="qa-icon">{a.icon}</span>
                    {a.label}
                    <ChevronRight className="qa-arrow" />
                  </button>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h5>
                  <Bell size={15} /> Notices
                </h5>
                {unreadCount > 0 && (
                  <span className="notice-count">{unreadCount}</span>
                )}
              </div>
              <div className="notice-list">
                {notifications.length === 0 && (
                  <div className="notice-row empty">No notices yet</div>
                )}
                {notifications.slice(0, 3).map((n) => (
                  <div className="notice-row" key={n._id}>
                    <strong>{n.title}</strong>
                    <span>{n.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OfficerDashboard;
