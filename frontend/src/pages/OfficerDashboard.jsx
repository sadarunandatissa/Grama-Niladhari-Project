// src/pages/OfficerDashboard.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import PendingVerifications from "../components/gn-officer/PendingVerifications";

const getApiUrl = () => {
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return "http://localhost:5000";
};

const OfficerDashboard = () => {
  const { user, token } = useAuth();
  const API_URL = getApiUrl();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/gn-officer/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.data);
        setFormData({
          full_name: res.data.data.full_name || "",
          phone: res.data.data.phone || "",
          email: res.data.data.email || "",
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      } catch (err) {
        setError("Failed to load profile.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      formData.new_password &&
      formData.new_password !== formData.confirm_password
    ) {
      setError("New passwords do not match.");
      return;
    }

    try {
      const payload = {
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
      };
      if (formData.current_password && formData.new_password) {
        payload.current_password = formData.current_password;
        payload.new_password = formData.new_password;
      }
      const res = await axios.put(
        `${API_URL}/api/gn-officer/profile`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSuccess("Profile updated successfully!");
      setProfile(res.data.data);
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    }
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="officer-dashboard">
      <div className="dashboard-header">
        <h1>GN Officer Dashboard</h1>
        <p>Welcome, {profile?.full_name}</p>
      </div>

      {/* Profile Section */}
      <section className="profile-section">
        <div className="profile-card">
          <div className="profile-header">
            <h2>Profile</h2>
            {!editMode && (
              <button className="btn-edit" onClick={() => setEditMode(true)}>
                Edit
              </button>
            )}
          </div>
          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">{success}</div>}

          {editMode ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Current Password (if changing)</label>
                <input
                  type="password"
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                />
              </div>
              <div className="form-actions">
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditMode(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-details">
              <p>
                <strong>Name:</strong> {profile?.full_name}
              </p>
              <p>
                <strong>Email:</strong> {profile?.email}
              </p>
              <p>
                <strong>Phone:</strong> {profile?.phone}
              </p>
              <p>
                <strong>Village:</strong>{" "}
                {profile?.village_id?.name || profile?.village_id}
              </p>
              {profile?.profile_picture && (
                <img
                  src={`${API_URL}${profile.profile_picture}`}
                  alt="Profile"
                  className="profile-pic"
                />
              )}
            </div>
          )}
        </div>
      </section>

      {/* Pending Verifications Section */}
      <section className="verifications-section">
        <h2>Pending Verifications</h2>
        <PendingVerifications />
      </section>
    </div>
  );
};

export default OfficerDashboard;
