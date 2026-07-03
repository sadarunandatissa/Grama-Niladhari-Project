import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PendingVerifications from "../components/gn-officer/PendingVerifications";
import "./OfficerDashboardPage.css";

const OfficerDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pending");

  // Redirect if not GN officer
  useEffect(() => {
    if (user && user.role !== "gn_officer") {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="officer-dashboard">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>🏛️ GN Dashboard</h2>
          <span className="village-name">
            {user.village_id || "Your Village"}
          </span>
        </div>
        <div className="nav-user">
          <span className="user-name">👤 {user.name}</span>
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome, {user.name}</h1>
          <p>Manage your village registrations and services</p>
        </div>

        <div className="tab-container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === "pending" ? "active" : ""}`}
              onClick={() => setActiveTab("pending")}
            >
              📋 Pending Verifications
            </button>
            <button
              className={`tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              📊 All Registrations
            </button>
            <button
              className={`tab ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => setActiveTab("reports")}
            >
              📈 Reports
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "pending" && <PendingVerifications />}
            {activeTab === "all" && (
              <div className="coming-soon">
                <h3>All Registrations</h3>
                <p>View all registrations with filters and search</p>
                <p className="hint">Coming soon...</p>
              </div>
            )}
            {activeTab === "reports" && (
              <div className="coming-soon">
                <h3>Reports & Analytics</h3>
                <p>Generate reports and view statistics</p>
                <p className="hint">Coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboardPage;
