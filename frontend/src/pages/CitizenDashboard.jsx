// src/pages/CitizenDashboard.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./CitizenDashboard.css";

// Child components
import CertificateRequestModal from "../components/certificate/CertificateRequestModal";
import CitizenCertificateList from "../components/certificate/CitizenCertificateList";
import CitizenNotifications from "../components/certificate/CitizenNotifications";
import AppointmentModal from "../components/appointments/AppointmentModal";
import ResidentAppointmentList from "../components/appointments/ResidentAppointmentList";
import ResidentAnnouncements from "../components/announcements/ResidentAnnouncements";
import PermitRequestModal from "../components/permits/PermitRequestModal";
import CitizenPermitList from "../components/permits/CitizenPermitList";

const getApiUrl = () => {
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return "http://localhost:5000";
};

/* ─── Inline icons (no extra dependency needed) ───────────── */
const IconProfile = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconCertificate = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
  </svg>
);
const IconCalendar = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const IconBell = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IconMegaphone = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 11l18-5v12L3 14v-3z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </svg>
);
const IconPin = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IconUser = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);
const IconPlus = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const IconPermit = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 12l2 2 4-4" />
    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.7 0 3.29.47 4.65 1.28" />
    <path d="M21 5l-3 3" />
  </svg>
);
const IconFamily = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const NAV_ITEMS = [
  { key: "profile", label: "Profile", icon: IconProfile },
  { key: "certificates", label: "Certificates", icon: IconCertificate },
  { key: "permits", label: "Permits", icon: IconPermit },
  { key: "appointments", label: "Appointments", icon: IconCalendar },
  { key: "notifications", label: "Notifications", icon: IconBell },
  { key: "announcements", label: "Announcements", icon: IconMegaphone },
];

const TAB_TITLES = {
  profile: "Profile",
  certificates: "Certificates",
  permits: "Permits",
  appointments: "Appointments",
  notifications: "Notifications",
  announcements: "Announcements",
};

const CitizenDashboard = () => {
  const { user, token, logout } = useAuth();
  const API_URL = getApiUrl();

  // State
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [familyMsg, setFamilyMsg] = useState("");
  const [activeTab, setActiveTab] = useState("certificates");
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showPermitModal, setShowPermitModal] = useState(false);
  const [permitRefreshKey, setPermitRefreshKey] = useState(0);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // ─── Fetch profile and requests ──────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, requestsRes] = await Promise.all([
        axios.get(`${API_URL}/api/citizen/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/citizen/requests`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setProfile(profileRes.data.data);
      setRequests(requestsRes.data.data || []);
    } catch (err) {
      setError("Failed to load dashboard.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch notifications ──────────────────────────────────
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/certificate/citizen/notifications`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // ─── Fetch announcements ──────────────────────────────────
  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/announcements/resident`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnouncements(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchNotifications();
    fetchAnnouncements();
  }, [token]);

  // ─── Create Family ───────────────────────────────────────
  const createFamily = async () => {
    if (
      !window.confirm(
        "Are you sure you want to create a new family? You must be the family head.",
      )
    )
      return;
    try {
      const res = await axios.post(
        `${API_URL}/api/citizen/family`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setFamilyMsg(
        `✅ Family created! Registration number: ${res.data.data.family_reg_no}`,
      );
      await fetchData();
    } catch (err) {
      setFamilyMsg(
        "❌ " + (err.response?.data?.message || "Failed to create family."),
      );
    }
  };

  // ─── Loading / Error States ──────────────────────────────
  if (loading) return <div className="loading-state">Loading dashboard...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!profile) return <div>No profile data.</div>;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="citizen-dashboard">
      {/* Left Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <div className="logo-badge">GN</div>
          <span>GN Digital Services</span>
        </div>

        <div className="sidebar-profile">
          <div className="sidebar-avatar">
            {profile.profile_picture ? (
              <img src={profile.profile_picture} alt="Profile" />
            ) : (
              <span>{profile.full_name.charAt(0)}</span>
            )}
          </div>
          <div className="sidebar-profile-text">
            <div className="sidebar-profile-title">Resident Dashboard</div>
            <div className="sidebar-profile-subtitle">GN Digital Services</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={activeTab === key ? "active" : ""}
              onClick={() => setActiveTab(key)}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!profile.family_id && profile.is_head && (
            <button onClick={createFamily} className="btn-create-family">
              <IconFamily />
              Create Family
            </button>
          )}
          <button className="btn-logout-sidebar" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-topbar">
          <h1>{TAB_TITLES[activeTab]}</h1>
          <div className="topbar-icons">
            <button className="icon-btn" aria-label="Notifications">
              <IconBell />
            </button>
            <button className="icon-btn" aria-label="Account">
              <IconUser />
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Greeting */}
          <div className="greeting-row">
            <h2 className="greeting-text">
              {getGreeting()}, {profile.full_name}!
            </h2>
            <span className="village-badge">
              <IconPin />
              {profile.village_id?.name || profile.village_id}
            </span>
          </div>

          {familyMsg && <div className="family-msg">{familyMsg}</div>}

          {/* Profile Summary Card */}
          <div className="profile-summary-card">
            <div className="summary-avatar">
              {profile.profile_picture ? (
                <img src={profile.profile_picture} alt="Profile" />
              ) : (
                <span>{profile.full_name.charAt(0)}</span>
              )}
            </div>
            <div className="summary-name-row">
              <span className="summary-name">{profile.full_name}</span>
              {profile.is_head && (
                <span className="badge-family-head">Family Head</span>
              )}
            </div>
            <div className="summary-details">
              <div className="summary-detail-item">
                <span className="label">NIC Number</span>
                <span className="value">***{profile.nic.slice(-4)}</span>
              </div>
              <div className="summary-detail-item">
                <span className="label">Village</span>
                <span className="value">
                  {profile.village_id?.name || profile.village_id}
                </span>
              </div>
              <div className="summary-detail-item">
                <span className="label">Family Reg</span>
                <span className="value">
                  {profile.family_id?.family_reg_no || "Not assigned"}
                </span>
              </div>
            </div>
          </div>

          {/* Tab-specific content */}
          {activeTab === "profile" && (
            <div className="tab-content profile-tab">
              <div className="section-header">
                <h2>My Profile</h2>
              </div>
              <div className="profile-full">
                <p>
                  <strong>Full Name:</strong> {profile.full_name}
                </p>
                <p>
                  <strong>NIC:</strong> {profile.nic}
                </p>
                <p>
                  <strong>Date of Birth:</strong>{" "}
                  {new Date(profile.date_of_birth).toLocaleDateString()}
                </p>
                <p>
                  <strong>Gender:</strong> {profile.gender}
                </p>
                <p>
                  <strong>Address:</strong> {profile.address}
                </p>
                <p>
                  <strong>Phone:</strong> {profile.phone_numbers?.join(", ")}
                </p>
                <p>
                  <strong>Email:</strong> {profile.email}
                </p>
                <p>
                  <strong>Occupation:</strong> {profile.occupation || "N/A"}
                </p>
                <p>
                  <strong>Family Members:</strong>{" "}
                  {profile.family_id?.members?.length || 0}
                </p>
              </div>
            </div>
          )}

          {activeTab === "certificates" && (
            <div className="tab-content certificates-tab">
              <div className="section-header">
                <h2>My Certificate Requests</h2>
                <button
                  className="btn-primary"
                  onClick={() => setShowCertificateModal(true)}
                >
                  <IconPlus /> Request Certificate
                </button>
              </div>
              <CitizenCertificateList />
            </div>
          )}

          {activeTab === "permits" && (
            <div className="tab-content permits-tab">
              <div className="section-header">
                <h2>My Permit Requests</h2>
                <button
                  className="btn-primary"
                  onClick={() => setShowPermitModal(true)}
                >
                  <IconPlus /> Request Permit
                </button>
              </div>
              <CitizenPermitList refreshKey={permitRefreshKey} />
            </div>
          )}

          {activeTab === "appointments" && (
            <div className="tab-content appointments-tab">
              <div className="section-header">
                <h2>My Appointments</h2>
                <button
                  className="btn-primary"
                  onClick={() => setShowAppointmentModal(true)}
                >
                  <IconPlus /> Book Appointment
                </button>
              </div>
              <ResidentAppointmentList />
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="tab-content notifications-tab">
              <div className="section-header">
                <h2>Notifications</h2>
              </div>
              <CitizenNotifications />
            </div>
          )}

          {activeTab === "announcements" && (
            <div className="tab-content announcements-tab">
              <div className="section-header">
                <h2>Announcements</h2>
              </div>
              <ResidentAnnouncements announcements={announcements} />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCertificateModal && (
        <CertificateRequestModal
          onClose={() => setShowCertificateModal(false)}
          onSuccess={() => {
            fetchData();
            setShowCertificateModal(false);
          }}
        />
      )}

      {showAppointmentModal && (
        <AppointmentModal
          onClose={() => setShowAppointmentModal(false)}
          onSuccess={() => {
            fetchData();
            setShowAppointmentModal(false);
          }}
        />
      )}

      {showPermitModal && (
        <PermitRequestModal
          onClose={() => setShowPermitModal(false)}
          onSuccess={() => {
            setPermitRefreshKey((prev) => prev + 1);
            setShowPermitModal(false);
          }}
        />
      )}
    </div>
  );
};

export default CitizenDashboard;
