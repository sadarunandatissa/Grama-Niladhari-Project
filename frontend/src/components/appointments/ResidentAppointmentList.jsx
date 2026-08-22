import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const ResidentAppointmentList = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/appointments/citizen/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const statusColors = {
    pending: "#f39c12",
    accepted: "#27ae60",
    rejected: "#e74c3c",
    rescheduled: "#3498db",
  };

  if (loading) return <div>Loading appointments...</div>;

  return (
    <div className="appointments-list">
      <h4>My Appointments</h4>
      {appointments.length === 0 ? (
        <p>No appointments yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Reason</th>
              <th>Status</th>
              <th>Proposed Slots</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((app) => (
              <tr key={app._id}>
                <td>{app.reason}</td>
                <td>
                  <span
                    style={{
                      background: statusColors[app.status],
                      color: "white",
                      padding: "2px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  >
                    {app.status}
                  </span>
                </td>

                <td>
                  {app.proposedSlots.map((slot, i) => (
                    <div key={i}>{new Date(slot).toLocaleString()}</div>
                  ))}
                  {/* Show selected slot if accepted */}
                  {app.status === "accepted" && app.selectedSlot && (
                    <div
                      style={{
                        color: "#27ae60",
                        fontWeight: "bold",
                        marginTop: "4px",
                      }}
                    >
                      ✅ Selected: {new Date(app.selectedSlot).toLocaleString()}
                    </div>
                  )}
                </td>
                <td>{app.officerMessage || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ResidentAppointmentList;
