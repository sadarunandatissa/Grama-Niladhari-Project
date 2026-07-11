import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        axios.get(`${API_URL}/api/citizen/requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
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

  if (loading) return <div className="loading">Loading dashboard...</div>;

  if (error) return <div className="error">{error}</div>;

  if (!profile) return <div>No profile data.</div>;

  const pendingRequests = requests.filter((r) => r.status === "pending").length;

  const approvedRequests = requests.filter(
    (r) => r.status === "approved",
  ).length;

  const rejectedRequests = requests.filter(
    (r) => r.status === "rejected",
  ).length;

  return (
    <div className="citizen-dashboard">
      {/* HEADER */}

      <div className="dashboard-header">
        <div>
          <h1>Welcome, {profile.full_name} 👋</h1>

          <p>Citizen Digital Administration Portal</p>
        </div>

        <div>
          <button className="btn-refresh" onClick={fetchData}>
            🔄 Refresh
          </button>

          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {familyMsg && <div className="family-msg">{familyMsg}</div>}

      {/* TOP CARDS */}

      <div className="dashboard-grid">
        {/* PROFILE */}

        <div className="dashboard-card">
          <h3>👤 My Profile</h3>

          {profile.profile_picture && (
            <img
              src={profile.profile_picture}
              alt="Profile"
              className="profile-image"
            />
          )}

          <p>
            <strong>Name:</strong>
            <br />
            {profile.full_name}
          </p>

          <p>
            <strong>Email:</strong>
            <br />
            {profile.email}
          </p>

          <p>
            <strong>NIC:</strong>
            <br />
            {profile.nic}
          </p>

          <p>
            <strong>Village:</strong>
            <br />

            {profile.village_id?.name || profile.village_id}
          </p>
        </div>

        {/* FAMILY */}

        <div className="dashboard-card">
          <h3>🏠 Family Information</h3>

          <p>Registration Number</p>

          <h2>{profile.family_id?.family_reg_no || "Not Assigned"}</h2>

          <p>Family Members</p>

          <h2>{profile.family_id?.members?.length || 0}</h2>

          <p>{profile.is_head ? "👑 Family Head" : "👤 Family Member"}</p>

          {!profile.family_id && profile.is_head && (
            <button className="btn-primary" onClick={createFamily}>
              Create Family
            </button>
          )}
        </div>

        {/* STATISTICS */}

        <div className="dashboard-card">
          <h3>📄 Request Summary</h3>

          <h1>{requests.length}</h1>

          <p>Total Requests</p>

          <hr />

          <p>
            🟡 Pending:
            <b>{pendingRequests}</b>
          </p>

          <p>
            🟢 Approved:
            <b>{approvedRequests}</b>
          </p>

          <p>
            🔴 Rejected:
            <b>{rejectedRequests}</b>
          </p>
        </div>
      </div>

      {/* QUICK ACTIONS */}

      <div className="section">
        <h2>Quick Actions</h2>

        <div className="quick-actions">
          <button className="action-card">📝 Request Certificate</button>

          <button className="action-card">📅 Book Appointment</button>

          <button className="action-card">👨‍👩‍👧 View Family</button>

          <button className="action-card">💬 Messages</button>

          <button className="action-card">📢 Announcements</button>
        </div>
      </div>

      {/* REQUEST TABLE */}

      <div className="section">
        <h2>My Service Requests</h2>

        {requests.length === 0 ? (
          <div className="empty-box">No requests available.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Request Type</th>

                <th>Status</th>

                <th>Date</th>

                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td>{r.type || "Registration"}</td>

                  <td>
                    <span className={`status-${r.status}`}>{r.status}</span>
                  </td>

                  <td>
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>
                    <button>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* NOTIFICATIONS */}

      <div className="section">
        <h2>🔔 Notifications</h2>

        <div className="notification-box">No new notifications.</div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
