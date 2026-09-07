// src/components/appointments/ResidentAppointmentList.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./ResidentAppointmentList.css";

const STATUS_LABELS = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  completed: "Completed",
};

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
  }, [token]);

  if (loading)
    return <div className="loading-state">Loading appointments...</div>;

  return (
    <div className="appointments-list">
      {appointments.length === 0 ? (
        <p className="empty-state">No appointments yet.</p>
      ) : (
        <div className="appointment-grid">
          {appointments.map((app) => (
            <div className="appointment-card" key={app._id}>
              <div className="appointment-card-top">
                <span className="appointment-reason">{app.reason}</span>
                <span className={`status-badge status-${app.status}`}>
                  {STATUS_LABELS[app.status] || app.status}
                </span>
              </div>

              <div className="appointment-slots-label">Proposed Slots</div>
              <div className="appointment-slots">
                {app.proposedSlots.map((slot, i) => (
                  <div key={i} className="slot-item">
                    {new Date(slot).toLocaleString()}
                  </div>
                ))}
              </div>

              {app.status === "accepted" && app.selectedSlot && (
                <div className="slot-selected">
                  ✅ Selected: {new Date(app.selectedSlot).toLocaleString()}
                </div>
              )}

              {app.officerMessage && (
                <div className="appointment-message">
                  <span className="label">Message from officer</span>
                  <p>{app.officerMessage}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResidentAppointmentList;
