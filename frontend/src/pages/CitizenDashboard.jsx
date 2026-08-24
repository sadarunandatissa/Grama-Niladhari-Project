// src/pages/CitizenDashboard.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./CitizenDashboard.css";
import CertificateRequestModal from "../components/certificate/CertificateRequestModal";
import CitizenCertificateList from "../components/certificate/CitizenCertificateList";
import CitizenNotifications from "../components/certificate/CitizenNotifications";
import AppointmentModal from "../components/appointments/AppointmentModal";
import ResidentAppointmentList from "../components/appointments/ResidentAppointmentList";
import ResidentAnnouncements from "../components/announcements/ResidentAnnouncements";

const getApiUrl = () => {
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return "http://localhost:5000";
};

const CitizenDashboard = () => {
  const { user, token, logout } = useAuth();
  const API_URL = getApiUrl();

  // ─── State ──────────────────────────────────────────────
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [familyMsg, setFamilyMsg] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [showCertificateModal, setShowCertificateModal] = useState(false);
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
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchNotifications();
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
  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) return <div>No profile data.</div>;

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="citizen-dashboard">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Welcome, {profile.full_name}</h1>
        <button className="btn-logout" onClick={logout}>
          Logout
        </button>
      </div>

      {familyMsg && <div className="family-msg">{familyMsg}</div>}

      {/* Profile Section */}
      <div className="profile-section">
        {profile.profile_picture && (
          <img
            src={profile.profile_picture}
            alt="Profile"
            className="profile-pic"
          />
        )}
        <div className="profile-info">
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>NIC:</strong> {profile.nic}
          </p>
          <p>
            <strong>Village:</strong>{" "}
            {profile.village_id?.name || profile.village_id}
          </p>
          <p>
            <strong>Family Registration Number:</strong>{" "}
            <span style={{ fontWeight: "bold", color: "#2c3e50" }}>
              {profile.family_id?.family_reg_no || "Not assigned yet"}
            </span>
          </p>
          <p>
            <strong>Family Members:</strong>{" "}
            {profile.family_id?.members?.length || 0}
          </p>
          <p>
            <strong>Head status:</strong>{" "}
            {profile.is_head ? "👑 Family Head" : "👤 Family Member"}
          </p>
          {!profile.family_id && profile.is_head && (
            <button onClick={createFamily} className="btn-create-family">
              Create Family
            </button>
          )}
          <button onClick={fetchData} className="btn-refresh">
            Refresh
          </button>
        </div>
      </div>

      {/* Service Requests */}
      <h2>My Service Requests</h2>
      {requests.length === 0 ? (
        <p>No requests yet.</p>
      ) : (
        <ul>
          {requests.map((r) => (
            <li key={r._id}>
              {r.type || "Registration"} –{" "}
              <span className={`status-${r.status}`}>{r.status}</span>
            </li>
          ))}
        </ul>
      )}


      {/* Tab Navigation */}
      <div className="citizen-tabs">
        <button
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button
          className={activeTab === "certificates" ? "active" : ""}
          onClick={() => setActiveTab("certificates")}
        >
          Certificates
        </button>
        <button
          className={activeTab === "notifications" ? "active" : ""}
          onClick={() => setActiveTab("notifications")}
        >
          Notifications
        </button>
        <button
          className={activeTab === "appointments" ? "active" : ""}
          onClick={() => setActiveTab("appointments")}
        >
          Appointments
        </button>
        <button
          className={activeTab === "announcements" ? "active" : ""}
          onClick={() => setActiveTab("announcements")}
        >
          Announcements
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "certificates" && (
        <div className="tab-content">
          <button
            className="btn-primary"
            onClick={() => setShowCertificateModal(true)}
          >
            Request Certificate
          </button>
          <CitizenCertificateList />
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="tab-content">
          <CitizenNotifications />
        </div>
      )}

      {activeTab === "appointments" && (
        <div className="tab-content">
          <button
            className="btn-primary"
            onClick={() => setShowAppointmentModal(true)}
          >
            Book Appointment
          </button>
          <ResidentAppointmentList />
        </div>
      )}

      {activeTab === "announcements" && (
        <div className="tab-content">
          <ResidentAnnouncements />
        </div>
      )}

      {/* Modals */}
      {showCertificateModal && (
        <CertificateRequestModal
          onClose={() => setShowCertificateModal(false)}
          onSuccess={() => {
            fetchData();
          }}
        />
      )}

      {showAppointmentModal && (
        <AppointmentModal
          onClose={() => setShowAppointmentModal(false)}
          onSuccess={() => {
            // Refresh appointment list (will happen automatically on next visit)
            // Optionally, you can trigger a refresh of the list
          }}
        />
      )}
    </div>
  );
};

export default CitizenDashboard;
