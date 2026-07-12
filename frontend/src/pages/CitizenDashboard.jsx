// src/pages/CitizenDashboard.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./CitizenDashboard.css"; // Create this file or remove the import

const getApiUrl = () => {
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return "http://localhost:5000";
};

const CitizenDashboard = () => {
  const { user, token, logout } = useAuth();
  const API_URL = getApiUrl();
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [familyMsg, setFamilyMsg] = useState("");

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

  useEffect(() => {
    fetchData();
  }, [token]);

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

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) return <div>No profile data.</div>;

  return (
    <div className="citizen-dashboard">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Welcome, {profile.full_name}</h1>
        <button onClick={logout} className="btn-logout">
          Logout
        </button>
      </div>

      {familyMsg && <div className="family-msg">{familyMsg}</div>}

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
    </div>
  );
};

export default CitizenDashboard;
