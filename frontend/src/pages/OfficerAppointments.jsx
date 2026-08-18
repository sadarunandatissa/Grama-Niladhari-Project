import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const OfficerAppointments = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
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

  // ─── Render Today's Schedule ─────────────────────────────
  const renderTodaySchedule = () => (
    <div className="today-schedule">
      <h3>📋 Today's Appointments</h3>
      {todayAppointments.length === 0 ? (
        <p className="no-appointments">No appointments scheduled for today.</p>
      ) : (
        <table className="data-table">
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
                <td>
                  <strong>{new Date(app.time).toLocaleTimeString()}</strong>
                </td>
                <td>{app.citizen?.full_name || "N/A"}</td>
                <td>
                  {app.citizen?.phone_numbers?.length > 0
                    ? app.citizen.phone_numbers.map((p, i) => (
                        <div key={i}>📞 {p}</div>
                      ))
                    : "—"}
                  {app.citizen?.email && (
                    <div style={{ fontSize: "12px", color: "#7f8c8d" }}>
                      ✉️ {app.citizen.email}
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
        <h3>⚠️ Time Slot Conflict</h3>
        <p>
          The selected time slot is already booked for another appointment.
          Please choose one of the suggested alternative slots below:
        </p>
        <div className="suggested-slots">
          {suggestedSlots.length === 0 ? (
            <p>No alternative slots available on this day.</p>
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

  if (loading) return <div className="loading">Loading appointments...</div>;

  return (
    <div className="officer-appointments">
      <div className="header">
        <h2>📅 Appointment Requests</h2>
        <button
          className={`btn-toggle-schedule ${showToday ? "active" : ""}`}
          onClick={() => setShowToday(!showToday)}
        >
          {showToday ? "Hide" : "Show"} Today's Schedule
        </button>
      </div>

      {showToday && renderTodaySchedule()}

      <div className="filter-bar">
        <label>Filter by status:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="rescheduled">Rescheduled</option>
        </select>
        <button className="btn-refresh" onClick={fetchAppointments}>
          🔄 Refresh
        </button>
      </div>

      {actionMessage && <div className="alert success">{actionMessage}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Citizen</th>
              <th>Reason</th>
              <th>Proposed Slots</th>
              <th>Selected Slot</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  No appointments found.
                </td>
              </tr>
            ) : (
              appointments.map((app) => (
                <tr key={app._id}>
                  <td>
                    <div>
                      <strong>{app.citizenId?.full_name}</strong>
                      <div style={{ fontSize: "12px", color: "#7f8c8d" }}>
                        {app.citizenId?.nic}
                      </div>
                    </div>
                  </td>
                  <td>{app.reason}</td>
                  <td>
                    {app.proposedSlots.map((slot, i) => (
                      <div key={i} className="slot-item">
                        {new Date(slot).toLocaleString()}
                      </div>
                    ))}
                  </td>
                  <td>
                    {app.status === "accepted" && app.selectedSlot ? (
                      <span className="selected-slot">
                        ✅ {new Date(app.selectedSlot).toLocaleString()}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <span className={`status-badge status-${app.status}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-edit"
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedApp(null)}
            >
              ×
            </button>
            <h3>Manage Appointment</h3>

            <div className="appointment-details">
              <p>
                <strong>Citizen:</strong> {selectedApp.citizenId?.full_name}
              </p>
              <p>
                <strong>NIC:</strong> {selectedApp.citizenId?.nic || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                {selectedApp.citizenId?.phone_numbers?.join(", ") || "N/A"}
              </p>
              <p>
                <strong>Reason:</strong> {selectedApp.reason}
              </p>
              <p>
                <strong>Current Status:</strong> {selectedApp.status}
              </p>
            </div>

            <div className="proposed-slots-list">
              <label>Proposed Time Slots:</label>
              <ul>
                {selectedApp.proposedSlots.map((slot, i) => (
                  <li key={i}>{new Date(slot).toLocaleString()}</li>
                ))}
              </ul>
            </div>

            <div className="form-group">
              <label>Select slot to accept</label>
              <select
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
              <small>Only required if accepting</small>
            </div>

            <div className="form-group">
              <label>Message to citizen</label>
              <textarea
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

            <div className="status-actions">
              <button
                className="btn-accept"
                onClick={() =>
                  updateStatus(
                    selectedApp._id,
                    "accepted",
                    selectedApp.selectedSlot,
                    selectedApp.officerMessage,
                  )
                }
              >
                Accept
              </button>
              <button
                className="btn-reschedule"
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
                Suggest Alternative
              </button>
              <button
                className="btn-reject"
                onClick={() =>
                  updateStatus(
                    selectedApp._id,
                    "rejected",
                    null,
                    selectedApp.officerMessage || "No reason provided.",
                  )
                }
              >
                Reject
              </button>
              <button
                className="btn-secondary"
                onClick={() => setSelectedApp(null)}
              >
                Cancel
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
