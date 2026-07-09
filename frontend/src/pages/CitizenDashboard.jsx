// frontend/src/pages/CitizenDashboard.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import axios from "axios";
// import "./CitizenDashboard.css";

const CitizenDashboard = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch citizen profile and requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile
        const profileRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/citizen/profile`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setProfile(profileRes.data.data);

        // Fetch recent requests (certificates, permits, etc.)
        const requestsRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/citizen/requests`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setRequests(requestsRes.data.data || []);
      } catch (err) {
        setError("Failed to load dashboard data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading)
    return <div className="dashboard-loading">Loading your dashboard...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;
  if (!profile)
    return <div className="dashboard-error">No profile data found.</div>;

  return (
    <div className="citizen-dashboard">
      {/* Header with welcome and profile picture */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Welcome, {profile.full_name}</h1>
          <p className="subtitle">Manage your GN services online</p>
        </div>
        <div className="header-right">
          {profile.profile_picture && (
            <img
              src={`${process.env.REACT_APP_API_URL}${profile.profile_picture}`}
              alt="Profile"
              className="profile-picture"
            />
          )}
          <span className="badge status-badge">
            {profile.is_verified ? "✅ Verified" : "⏳ Pending Verification"}
          </span>
        </div>
      </header>

      {/* Quick stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{requests.length}</span>
          <span className="stat-label">Total Requests</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {requests.filter((r) => r.status === "pending").length}
          </span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {requests.filter((r) => r.status === "approved").length}
          </span>
          <span className="stat-label">Approved</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{profile.family_id ? "👨‍👩‍👧‍👦" : "👤"}</span>
          <span className="stat-label">
            {profile.is_head ? "Family Head" : "Family Member"}
          </span>
        </div>
      </div>

      {/* Quick actions */}
      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <Link to="/citizen/request-certificate" className="action-btn">
            📄 Request Certificate
          </Link>
          <Link to="/citizen/apply-permit" className="action-btn">
            🏗️ Apply for Permit
          </Link>
          <Link to="/citizen/appointment" className="action-btn">
            📅 Book Appointment
          </Link>
          <Link to="/citizen/family" className="action-btn">
            👨‍👩‍👧‍👦 Manage Family
          </Link>
          <Link to="/citizen/profile" className="action-btn">
            ✏️ Edit Profile
          </Link>
        </div>
      </section>

      {/* Recent requests */}
      <section className="recent-requests">
        <h2>Recent Service Requests</h2>
        {requests.length === 0 ? (
          <p className="empty-state">You haven't made any requests yet.</p>
        ) : (
          <div className="requests-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.slice(0, 5).map((req) => (
                  <tr key={req._id}>
                    <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td>{req.type}</td>
                    <td>
                      <span className={`status-${req.status}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/citizen/request/${req._id}`}>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {requests.length > 5 && (
          <Link to="/citizen/requests" className="view-all">
            View all requests →
          </Link>
        )}
      </section>

      {/* Notifications (placeholder) */}
      <section className="notifications">
        <h2>Notifications</h2>
        <div className="notification-item">
          <p>You have no new notifications.</p>
        </div>
      </section>
    </div>
  );
};

export default CitizenDashboard;
