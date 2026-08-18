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

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const updateStatus = async (id, status, selectedSlot, message) => {
    try {
      await axios.put(
        `${API_URL}/api/appointments/officer/${id}`,
        { status, selectedSlot, officerMessage: message },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setActionMessage("Appointment updated successfully.");
      fetchAppointments();
      setSelectedApp(null);
    } catch (err) {
      alert(err.response?.data?.message || "Update failed.");
    }
  };

  if (loading) return <div>Loading appointments...</div>;

  return (
    <div className="officer-appointments">
      <h2>📅 Appointment Requests</h2>

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

      <table className="data-table">
        <thead>
          <tr>
            <th>Citizen</th>
            <th>Reason</th>
            <th>Proposed Slots</th>
            <th>Selected Slot</th> {/* ← new column */}
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((app) => (
            <tr key={app._id}>
              <td>{app.citizenId?.full_name}</td>
              <td>{app.reason}</td>
              <td>
                {app.proposedSlots.map((slot, i) => (
                  <div key={i}>{new Date(slot).toLocaleString()}</div>
                ))}
              </td>
              <td>
                {app.status === "accepted" && app.selectedSlot ? (
                  <span style={{ color: "#27ae60", fontWeight: "bold" }}>
                    {new Date(app.selectedSlot).toLocaleString()}
                  </span>
                ) : (
                  "—"
                )}
              </td>
              <td>{app.status}</td>
              <td>
                <button
                  className="btn-edit"
                  onClick={() => setSelectedApp(app)}
                >
                  Manage
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Manage Appointment</h3>
            <p>
              <strong>Citizen:</strong> {selectedApp.citizenId?.full_name}
            </p>
            <p>
              <strong>Reason:</strong> {selectedApp.reason}
            </p>
            <p>
              <strong>Proposed Slots:</strong>
            </p>
            <ul>
              {selectedApp.proposedSlots.map((slot, i) => (
                <li key={i}>{new Date(slot).toLocaleString()}</li>
              ))}
            </ul>

            <div className="form-group">
              <label>Select slot to accept (optional)</label>
              <select
                onChange={(e) =>
                  setSelectedApp({
                    ...selectedApp,
                    selectedSlot: e.target.value,
                  })
                }
                value={selectedApp.selectedSlot || ""}
              >
                <option value="">-- Select --</option>
                {selectedApp.proposedSlots.map((slot, i) => (
                  <option key={i} value={slot}>
                    {new Date(slot).toLocaleString()}
                  </option>
                ))}
              </select>
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
                    selectedApp.officerMessage || "Please propose new times.",
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerAppointments;
