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
  House,
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

const emptyStats = {
  certificates: {
    pending: 0,
    approved: 0,
    rejected: 0,
    monthly: new Array(12).fill(0),
    recent: [],
  },
  permits: {
    pending: 0,
    approved: 0,
    rejected: 0,
    monthly: new Array(12).fill(0),
    recent: [],
  },
  citizenStats: { totalCitizens: 0, totalFamilies: 0, totalHouses: 0 },
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

  const { certificates, permits, citizenStats } = stats;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const activeData = activeTab === "certificates" ? certificates : permits;
  const activeColor = activeTab === "certificates" ? "#2563eb" : "#16a34a";
  const activeTotal =
    activeData.pending + activeData.approved + activeData.rejected;

  const highestMonthIdx = activeData.monthly.reduce(
    (best, val, idx, arr) => (val > arr[best] ? idx : best),
    0,
  );

  const citizenTotal =
    citizenStats.totalCitizens +
    citizenStats.totalFamilies +
    citizenStats.totalHouses;
  const pct = (value) =>
    citizenTotal ? Math.round((value / citizenTotal) * 100) : 0;

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
            <UsersRound />
            <div>
              <strong>{citizenStats.totalCitizens}</strong>
              <span>Total Citizens</span>
            </div>
          </div>
          <div className="kpi-card" style={{ "--kpi-color": "#7c3aed" }}>
            <House />
            <div>
              <strong>{citizenStats.totalHouses}</strong>
              <span>Total Houses</span>
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
                <h5>Monthly Trend</h5>
                <span className="panel-note">
                  Busiest month:{" "}
                  <strong>{MONTH_LABELS[highestMonthIdx]}</strong>
                </span>
              </div>
              <BarChart
                labels={MONTH_LABELS}
                series={[
                  {
                    name: activeTab,
                    color: activeColor,
                    data: activeData.monthly,
                  },
                ]}
              />
            </div>
          </div>

          {/* Side column */}
          <div className="side-column">
            <div className="panel">
              <div className="panel-header">
                <h5>Citizens Overview</h5>
              </div>
              <div className="donut-row">
                <DonutChart
                  size={120}
                  strokeWidth={20}
                  segments={[
                    {
                      label: "Citizens",
                      value: citizenStats.totalCitizens,
                      color: "#2563eb",
                    },
                    {
                      label: "Families",
                      value: citizenStats.totalFamilies,
                      color: "#f97316",
                    },
                    {
                      label: "Houses",
                      value: citizenStats.totalHouses,
                      color: "#16a34a",
                    },
                  ]}
                />
                <div className="donut-legend">
                  <div className="legend-row">
                    <span className="dot" style={{ background: "#2563eb" }} />
                    Citizens <strong>{pct(citizenStats.totalCitizens)}%</strong>
                  </div>
                  <div className="legend-row">
                    <span className="dot" style={{ background: "#f97316" }} />
                    Families <strong>{pct(citizenStats.totalFamilies)}%</strong>
                  </div>
                  <div className="legend-row">
                    <span className="dot" style={{ background: "#16a34a" }} />
                    Houses <strong>{pct(citizenStats.totalHouses)}%</strong>
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
