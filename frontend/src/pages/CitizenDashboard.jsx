import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
// import "./CitizenDashboard.css";

const CitizenDashboard = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchData = async () => {
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
        setRequests(requestsRes.data.data);
      } catch (err) {
        setError("Failed to load dashboard.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="citizen-dashboard">
      <h1>Welcome, {profile?.full_name}</h1>
      <div className="profile-section">
        {profile?.profile_picture && (
          <img
            src={`${API_URL}${profile.profile_picture}`}
            alt="Profile"
            className="profile-pic"
          />
        )}
        <div className="profile-info">
          <p>
            <strong>Email:</strong> {profile?.email}
          </p>
          <p>
            <strong>NIC:</strong> {profile?.nic}
          </p>
          <p>
            <strong>Village:</strong>{" "}
            {profile?.village_id?.name || profile?.village_id}
          </p>
          <p>
            <strong>Family:</strong>{" "}
            {profile?.family_id ? "Member" : "No family yet"}
          </p>
          {profile?.is_head && (
            <p>
              <strong>Family Head</strong>
            </p>
          )}
        </div>
      </div>

      <h2>My Service Requests</h2>
      {requests.length === 0 ? (
        <p>No requests yet.</p>
      ) : (
        <ul>
          {requests.map((r) => (
            <li key={r._id}>
              {r.type} –{" "}
              <span className={`status-${r.status}`}>{r.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CitizenDashboard;
