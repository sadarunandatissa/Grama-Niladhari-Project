import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/gn-officer/Sidebar";
import "./OfficerAppointments.css";

import {
  CalendarDays,
  RefreshCw,
  X,
  ChevronDown,
  Search,
  Phone,
  Mail,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  Repeat,
  AlertTriangle,
} from "lucide-react";

const STATUS_META = {
  all: { label: "All", tone: "blue", icon: Inbox },
  pending: { label: "Pending", tone: "orange", icon: Clock },
  accepted: { label: "Accepted", tone: "green", icon: CheckCircle2 },
  rejected: { label: "Rejected", tone: "red", icon: XCircle },
  rescheduled: { label: "Rescheduled", tone: "purple", icon: Repeat },
};

const OfficerAppointments = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [showToday, setShowToday] = useState(false);
  const [showConflict, setShowConflict] = useState(false);
  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const [pendingUpdateId, setPendingUpdateId] = useState(null);
  const [pendingMessage, setPendingMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // ─── Fetch Appointments ──────────────────────────────────
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/appointments/officer?status=${filter}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setAppointments(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch Today's Schedule ──────────────────────────────
  const fetchTodaySchedule = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/appointments/officer/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodayAppointments(res.data.data);
    } catch (err) {
      console.error("Failed to fetch today's schedule:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchTodaySchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // ─── Update Status with Conflict Handling ────────────────
  const updateStatus = async (id, status, selectedSlot, message) => {
    try {
      const payload = { status, officerMessage: message };
      if (selectedSlot) payload.selectedSlot = selectedSlot;

      await axios.put(`${API_URL}/api/appointments/officer/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActionMessage("Appointment updated successfully.");
      fetchAppointments();
      fetchTodaySchedule();
      setSelectedApp(null);
      setShowConflict(false);
      setSuggestedSlots([]);
    } catch (err) {
      if (err.response?.status === 409) {
        // ─── Conflict: Show suggested alternative slots ──────
        setSuggestedSlots(err.response.data.suggestedSlots || []);
        setShowConflict(true);
        setPendingUpdateId(id);
        setPendingMessage(message);
      } else {
        alert(err.response?.data?.message || "Update failed.");
      }
    }
  };

  // ─── Handle Suggested Slot Selection ─────────────────────
  const handleSuggestedSlot = (slot) => {
    updateStatus(pendingUpdateId, "accepted", slot, pendingMessage);
  };

  const filteredAppointments = useMemo(
    () =>
      appointments.filter((app) =>
        searchTerm.trim()
          ? app.citizenId?.full_name
              ?.toLowerCase()
              .includes(searchTerm.trim().toLowerCase())
          : true,
      ),
    [appointments, searchTerm],
  );

  // ─── Render Today's Schedule ─────────────────────────────
  const renderTodaySchedule = () => (
    <div className="card today-schedule">
      <h3>Today's Appointments</h3>
      {todayAppointments.length === 0 ? (
        <p className="no-appointments">No appointments scheduled for today.</p>
      ) : (
        <table className="today-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Citizen</th>
              <th>Contact</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {todayAppointments.map((app, idx) => (
              <tr key={idx}>
                <td className="time-col">
                  <strong>{new Date(app.time).toLocaleTimeString()}</strong>
                </td>
                <td>{app.citizen?.full_name || "N/A"}</td>
                <td>
                  {app.citizen?.phone_numbers?.length > 0
                    ? app.citizen.phone_numbers.map((p, i) => (
                        <div className="contact-line" key={i}>
                          <Phone size={13} /> {p}
                        </div>
                      ))
                    : "—"}
                  {app.citizen?.email && (
                    <div className="contact-line contact-email">
                      <Mail size={13} /> {app.citizen.email}
                    </div>
                  )}
                </td>
                <td>{app.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // ─── Render Conflict Modal ───────────────────────────────
  const renderConflictModal = () => (
    <div className="modal-overlay" onClick={() => setShowConflict(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="conflict-header">
          <span className="conflict-icon">
            <AlertTriangle size={18} />
          </span>
          <h3>Time Slot Conflict</h3>
        </div>
        <p className="conflict-copy">
          The selected time slot is already booked for another appointment.
          Choose one of the alternative slots below.
        </p>
        <div className="suggested-slots">
          {suggestedSlots.length === 0 ? (
            <p className="no-appointments">
              No alternative slots available on this day.
            </p>
          ) : (
            suggestedSlots.map((slot, i) => (
              <button
                key={i}
                className="btn-suggest"
                onClick={() => handleSuggestedSlot(slot)}
              >
                {new Date(slot).toLocaleString()}
              </button>
            ))
          )}
        </div>
        <button
          className="btn-secondary"
          onClick={() => {
            setShowConflict(false);
            setSuggestedSlots([]);
            setPendingUpdateId(null);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  if (loading)
    return <div className="loading-state">Loading appointments…</div>;

  return (
    <div className="appointments-wrapper">
      <div className="header">
        <div className="header-title">
          <span className="header-icon">
            <CalendarDays size={18} />
          </span>
          <div>
            <h2>Appointment Requests</h2>
            <p className="header-subtitle">{appointments.length} shown</p>
          </div>
        </div>
      </div>

      {actionMessage && <div className="alert success">{actionMessage}</div>}

      {/* ---------- Status filter cards ---------- */}
      <div className="stat-cards">
        {Object.entries(STATUS_META).map(([key, meta]) => {
          const Icon = meta.icon;
          return (
            <button
              key={key}
              className={`stat-card stat-${meta.tone} ${filter === key ? "is-active" : ""}`}
              onClick={() => setFilter(key)}
            >
              <span className="stat-icon">
                <Icon size={16} />
              </span>
              <span className="stat-label">{meta.label}</span>
            </button>
          );
        })}
      </div>

      {/* ---------- Toolbar ---------- */}
      <div className="card toolbar">
        <div className="search-box">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search by citizen name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="action-buttons">
          <button className="btn btn-refresh" onClick={fetchAppointments}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            className={`btn btn-toggle-schedule ${showToday ? "active" : ""}`}
            onClick={() => setShowToday(!showToday)}
          >
            {showToday ? "Hide" : "Show"} Today's Schedule
          </button>
        </div>
      </div>

      {showToday && renderTodaySchedule()}

      <div className="card table-card main-table-card">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Citizen</th>
              <th>Reason</th>
              <th>Proposed Slots</th>
              <th>Selected Slot</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  No appointments match this view.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((app) => (
                <tr key={app._id}>
                  <td>
                    <div>
                      <strong className="citizen-name">
                        {app.citizenId?.full_name}
                      </strong>
                      <div className="nic-number">{app.citizenId?.nic}</div>
                    </div>
                  </td>
                  <td>{app.reason}</td>
                  <td className="slots-col">
                    {app.proposedSlots.map((slot, i) => (
                      <div key={i} className="slot-pill">
                        {new Date(slot).toLocaleString()}
                      </div>
                    ))}
                  </td>
                  <td>
                    {app.status === "accepted" && app.selectedSlot ? (
                      <span className="selected-slot">
                        {new Date(app.selectedSlot).toLocaleString()}
                      </span>
                    ) : (
                      <span className="cell-muted">—</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge status-${app.status}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-edit"
                      onClick={() => setSelectedApp(app)}
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

      {/* ─── Manage Appointment Modal ──────────────────────── */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Appointment</h2>
              <button
                className="btn-close"
                onClick={() => setSelectedApp(null)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="appointment-modal-body">
              <div className="appointment-details">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Citizen</span>
                    <span className="info-value">
                      {selectedApp.citizenId?.full_name}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">NIC</span>
                    <span className="info-value">
                      {selectedApp.citizenId?.nic || "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">
                      {selectedApp.citizenId?.phone_numbers?.join(", ") ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Current Status</span>
                    <span
                      className={`status-badge status-${selectedApp.status}`}
                    >
                      {selectedApp.status}
                    </span>
                  </div>
                  <div className="info-item info-item-wide">
                    <span className="info-label">Reason</span>
                    <span className="info-value">{selectedApp.reason}</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="group-label">Proposed Time Slots</label>
                <div className="time-slots-list">
                  {selectedApp.proposedSlots.map((slot, i) => (
                    <span key={i} className="slot-pill">
                      {new Date(slot).toLocaleString()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="slot-select" className="group-label">
                  Select slot to accept
                </label>
                <div className="select-wrapper">
                  <select
                    id="slot-select"
                    onChange={(e) =>
                      setSelectedApp({
                        ...selectedApp,
                        selectedSlot: e.target.value,
                      })
                    }
                    value={selectedApp.selectedSlot || ""}
                  >
                    <option value="">-- Select a slot --</option>
                    {selectedApp.proposedSlots.map((slot, i) => (
                      <option key={i} value={slot}>
                        {new Date(slot).toLocaleString()}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={15} />
                </div>
                <span className="field-hint">Only required if accepting</span>
              </div>

              <div className="form-group">
                <label htmlFor="message-input" className="group-label">
                  Message to citizen
                </label>
                <textarea
                  id="message-input"
                  value={selectedApp.officerMessage || ""}
                  onChange={(e) =>
                    setSelectedApp({
                      ...selectedApp,
                      officerMessage: e.target.value,
                    })
                  }
                  placeholder="Add a message (e.g., reason for rejection or alternative suggestion)"
                  rows="3"
                />
              </div>
            </div>

            <div className="status-actions">
              <button
                className="btn btn-accept"
                onClick={() =>
                  updateStatus(
                    selectedApp._id,
                    "accepted",
                    selectedApp.selectedSlot,
                    selectedApp.officerMessage,
                  )
                }
              >
                <CheckCircle2 size={15} /> Accept
              </button>

              <button
                className="btn btn-reschedule"
                onClick={() =>
                  updateStatus(
                    selectedApp._id,
                    "rescheduled",
                    null,
                    selectedApp.officerMessage ||
                      "Please propose new time slots.",
                  )
                }
              >
                <Repeat size={15} /> Suggest Alternative
              </button>

              <button
                className="btn btn-reject"
                onClick={() =>
                  updateStatus(
                    selectedApp._id,
                    "rejected",
                    null,
                    selectedApp.officerMessage || "No reason provided.",
                  )
                }
              >
                <XCircle size={15} /> Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Conflict Modal ────────────────────────────────── */}
      {showConflict && renderConflictModal()}
    </div>
  );
};

export default OfficerAppointments;
