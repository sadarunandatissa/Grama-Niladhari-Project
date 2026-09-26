import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./OfficerPermits.css";

const STATUS_META = {
  all: { label: "All Requests", tone: "blue" },
  not_seen: { label: "Not Seen", tone: "orange" },
  in_progress: { label: "In Progress", tone: "purple" },
  accepted: { label: "Accepted", tone: "green" },
  rejected: { label: "Rejected", tone: "red" },
};

const prettifyKey = (key) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const IconDocument = () => (
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

const IconXCircle = () => (
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
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
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

const IconClose = () => (
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
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const OfficerPermits = () => {
  const { token } = useAuth();
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchPermits = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/permits/officer?status=${filter}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setPermits(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (id, status, reason = "") => {
    try {
      await axios.put(
        `${API_URL}/api/permits/officer/${id}`,
        {
          status,
          rejectionReason: reason,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setActionMessage(`Permit marked as ${status.replace("_", " ")}.`);
      fetchPermits();
      setSelectedPermit(null);
      setRejectReason("");
    } catch (err) {
      alert(err.response?.data?.message || "Update failed.");
    }
  };

  const openManage = (permit) => {
    setSelectedPermit(permit);
    setRejectReason("");
  };

  const filteredPermits = useMemo(
    () =>
      permits.filter((p) =>
        searchTerm.trim()
          ? p.citizenId?.full_name
              ?.toLowerCase()
              .includes(searchTerm.trim().toLowerCase())
          : true,
      ),
    [permits, searchTerm],
  );

  return (
    <div className="officer-permits">
      <div className="header">
        <div className="header-title">
          <span className="header-icon">
            <IconDocument />
          </span>
          <div>
            <h2>Permit Requests</h2>
            <p className="header-subtitle">{permits.length} shown</p>
          </div>
        </div>
      </div>

      {actionMessage && <div className="alert success">{actionMessage}</div>}

      {/* ---------- Status filter cards ---------- */}
      <div className="stat-cards">
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <button
            key={key}
            className={`stat-card stat-${meta.tone} ${filter === key ? "is-active" : ""}`}
            onClick={() => setFilter(key)}
          >
            <span className="stat-icon">
              {key === "all" && <IconInbox />}
              {key === "not_seen" && <IconClock />}
              {key === "in_progress" && <IconClock />}
              {key === "accepted" && <IconCheckCircle />}
              {key === "rejected" && <IconXCircle />}
            </span>
            <span className="stat-label">{meta.label}</span>
          </button>
        ))}
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
        <button className="btn-refresh" onClick={fetchPermits}>
          <IconRefresh />
          Refresh
        </button>
      </div>

      {/* ---------- Table ---------- */}
      {loading ? (
        <div className="loading-state">Loading permit requests…</div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Citizen</th>
                <th>Type</th>
                <th>Status</th>
                <th>Requested</th>
                <th>Warning</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredPermits.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    No permit requests match this view.
                  </td>
                </tr>
              ) : (
                filteredPermits.map((p) => (
                  <tr key={p._id}>
                    <td className="cell-title">{p.citizenId?.full_name}</td>
                    <td>{p.permitType}</td>
                    <td>
                      <span className={`status-badge status-${p.status}`}>
                        {p.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="cell-muted">
                      {new Date(p.requestedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span
                        className={`warning-icon ${p.warning ? "is-warning" : "is-ok"}`}
                        title={p.warning ? "Needs attention" : "No issues"}
                      >
                        {p.warning ? <IconWarning /> : <IconCheck />}
                      </span>
                    </td>
                    <td className="cell-actions">
                      <button
                        className="btn-edit"
                        onClick={() => openManage(p)}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- Manage modal ---------- */}
      {selectedPermit && (
        <div className="modal-overlay" onClick={() => setSelectedPermit(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{selectedPermit.permitType}</h3>
                <p className="modal-subtitle">
                  {selectedPermit.citizenId?.full_name}
                </p>
              </div>
              <button
                className="btn-icon"
                onClick={() => setSelectedPermit(null)}
                aria-label="Close"
              >
                <IconClose />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h4>Current Status</h4>
                <span
                  className={`status-badge status-${selectedPermit.status}`}
                >
                  {selectedPermit.status.replace("_", " ")}
                </span>
              </div>

              {selectedPermit.formData &&
                Object.keys(selectedPermit.formData).length > 0 && (
                  <div className="modal-section">
                    <h4>Submitted Details</h4>
                    <div className="fact-list">
                      {Object.entries(selectedPermit.formData).map(
                        ([key, value]) => (
                          <div className="fact-row" key={key}>
                            <span className="fact-label">
                              {prettifyKey(key)}
                            </span>
                            <span className="fact-value">
                              {typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value)}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              <div className="modal-section">
                <h4>Rejection Reason</h4>
                <textarea
                  placeholder="Only required if rejecting this request…"
                  rows="3"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-accept"
                onClick={() => updateStatus(selectedPermit._id, "accepted")}
              >
                <IconCheckCircle /> Accept
              </button>
              <button
                className="btn-inprogress"
                onClick={() => updateStatus(selectedPermit._id, "in_progress")}
              >
                <IconClock /> In Progress
              </button>
              <button
                className="btn-reject"
                onClick={() =>
                  updateStatus(
                    selectedPermit._id,
                    "rejected",
                    rejectReason.trim() || "No reason provided",
                  )
                }
              >
                <IconXCircle /> Reject
              </button>
              <button
                className="btn-secondary"
                onClick={() => setSelectedPermit(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerPermits;
