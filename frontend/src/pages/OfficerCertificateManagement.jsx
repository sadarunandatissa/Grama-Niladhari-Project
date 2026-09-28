import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./OfficerCertificateManagement.css";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "not_seen", label: "Not Seen" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

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
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
    <path d="M9 13h6" />
    <path d="M9 17h6" />
  </svg>
);

const IconInbox = () => (
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
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
  </svg>
);

const IconClock = () => (
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
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

const IconCheckCircle = () => (
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
    <circle cx="12" cy="12" r="9" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconSearch = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const IconRefresh = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-2.64-6.36" />
    <path d="M21 4v5h-5" />
  </svg>
);

const IconWarning = () => (
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
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconCheck = () => (
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
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const OfficerCertificateManagement = () => {
  const { token } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/certificate/officer/pending`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setCertificates(res.data.data);
    } catch (err) {
      setMessage("Failed to load certificate requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const updateStatus = async (certId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/api/certificate/officer/update/${certId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessage("Status updated successfully.");
      fetchCertificates();
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed.");
    }
  };

  const counts = useMemo(
    () => ({
      all: certificates.length,
      not_seen: certificates.filter((c) => c.status === "not_seen").length,
      in_progress: certificates.filter((c) => c.status === "in_progress")
        .length,
      completed: certificates.filter((c) => c.status === "completed").length,
    }),
    [certificates],
  );

  const filtered = certificates
    .filter((c) => statusFilter === "all" || c.status === statusFilter)
    .filter((c) =>
      searchTerm.trim()
        ? c.citizenId?.full_name
            ?.toLowerCase()
            .includes(searchTerm.trim().toLowerCase())
        : true,
    );

  return (
    <div className="officer-certificate-management">
      <div className="header">
        <div className="header-title">
          <span className="header-icon">
            <IconCertificate />
          </span>
          <div>
            <h2>Certificate Requests</h2>
            <p className="header-subtitle">{certificates.length} total</p>
          </div>
        </div>
      </div>

      {message && <div className="alert info">{message}</div>}

      {/* ---------- Overview stat cards ---------- */}
      <div className="stat-cards">
        <button
          className={`stat-card stat-blue ${statusFilter === "all" ? "is-active" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          <span className="stat-icon">
            <IconInbox />
          </span>
          <span className="stat-value">{counts.all}</span>
          <span className="stat-label">All Requests</span>
        </button>
        <button
          className={`stat-card stat-orange ${statusFilter === "not_seen" ? "is-active" : ""}`}
          onClick={() => setStatusFilter("not_seen")}
        >
          <span className="stat-icon">
            <IconClock />
          </span>
          <span className="stat-value">{counts.not_seen}</span>
          <span className="stat-label">Not Seen</span>
        </button>
        <button
          className={`stat-card stat-purple ${statusFilter === "in_progress" ? "is-active" : ""}`}
          onClick={() => setStatusFilter("in_progress")}
        >
          <span className="stat-icon">
            <IconClock />
          </span>
          <span className="stat-value">{counts.in_progress}</span>
          <span className="stat-label">In Progress</span>
        </button>
        <button
          className={`stat-card stat-green ${statusFilter === "completed" ? "is-active" : ""}`}
          onClick={() => setStatusFilter("completed")}
        >
          <span className="stat-icon">
            <IconCheckCircle />
          </span>
          <span className="stat-value">{counts.completed}</span>
          <span className="stat-label">Completed</span>
        </button>
      </div>

      {/* ---------- Toolbar ---------- */}
      <div className="toolbar">
        <div className="search-box">
          <IconSearch />
          <input
            type="text"
            placeholder="Search by citizen name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="tab-group">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              className={`tab ${statusFilter === tab.value ? "is-active" : ""}`}
              onClick={() => setStatusFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button className="btn-refresh" onClick={fetchCertificates}>
          <IconRefresh />
          Refresh
        </button>
      </div>

      {/* ---------- Table ---------- */}
      {loading ? (
        <div className="loading-state">Loading certificate requests…</div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Citizen</th>
                <th>Type</th>
                <th>Requested</th>
                <th>Warning</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    No certificate requests match this view.
                  </td>
                </tr>
              ) : (
                filtered.map((cert) => (
                  <tr key={cert._id}>
                    <td className="cell-title">{cert.citizenId?.full_name}</td>
                    <td>
                      {cert.certificateType.replace("_", " ").toUpperCase()}
                    </td>
                    <td className="cell-muted">
                      {new Date(cert.requestedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span
                        className={`warning-icon ${cert.warning ? "is-warning" : "is-ok"}`}
                        title={cert.warning ? "Needs attention" : "No issues"}
                      >
                        {cert.warning ? <IconWarning /> : <IconCheck />}
                      </span>
                    </td>
                    <td>
                      <select
                        className={`status-select status-${cert.status}`}
                        value={cert.status}
                        onChange={(e) => updateStatus(cert._id, e.target.value)}
                        disabled={cert.status === "rejected"}
                      >
                        <option value="not_seen">Not Seen</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        {cert.status === "rejected" && (
                          <option value="rejected">Rejected</option>
                        )}
                      </select>
                    </td>
                    <td className="cell-actions">
                      <Link
                        to={`/officer/certificate/${cert._id}`}
                        className="btn-view"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OfficerCertificateManagement;
