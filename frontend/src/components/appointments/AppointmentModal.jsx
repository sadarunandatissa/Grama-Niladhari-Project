import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./AppointmentModal.css";

const AppointmentModal = ({ onClose, onSuccess }) => {
  const { token } = useAuth();
  const [reason, setReason] = useState("");
  const [slots, setSlots] = useState([{ date: "", time: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const addSlot = () => {
    if (slots.length < 5) {
      setSlots([...slots, { date: "", time: "" }]);
    }
  };

  const removeSlot = (index) => {
    if (slots.length > 1) {
      setSlots(slots.filter((_, i) => i !== index));
    }
  };

  const handleSlotChange = (index, field, value) => {
    const updated = [...slots];
    updated[index][field] = value;
    setSlots(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!reason.trim()) {
      setError("Please enter a reason.");
      return;
    }

    // Validate slots
    const proposedSlots = [];
    for (let slot of slots) {
      if (!slot.date || !slot.time) {
        setError("Please fill in all date and time fields.");
        return;
      }
      const dateTime = new Date(`${slot.date}T${slot.time}`);
      if (isNaN(dateTime.getTime())) {
        setError("Invalid date/time format.");
        return;
      }
      proposedSlots.push(dateTime.toISOString());
    }

    setLoading(true);
    try {
      const payload = { reason: reason.trim(), proposedSlots };
      const res = await axios.post(
        `${API_URL}/api/appointments/citizen`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSuccess("Appointment requested successfully!");
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h3>Book Appointment</h3>
        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Reason *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe the purpose of your visit"
              rows="3"
              required
            />
          </div>

          <label>
            Select up to 5 preferred time slots (Mon–Fri, 8am–4pm) *
          </label>
          {slots.map((slot, index) => (
            <div key={index} className="slot-row">
              <input
                type="date"
                value={slot.date}
                onChange={(e) =>
                  handleSlotChange(index, "date", e.target.value)
                }
                required
                min={new Date().toISOString().split("T")[0]} // prevent past dates
              />
              <input
                type="time"
                value={slot.time}
                onChange={(e) =>
                  handleSlotChange(index, "time", e.target.value)
                }
                required
                min="08:00"
                max="16:00"
                step="1800" // 30-minute intervals
              />
              {slots.length > 1 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeSlot(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn-add" onClick={addSlot}>
            + Add another time
          </button>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
