import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
// import "./OfficerPermits.css";

const OfficerPermits = () => {
  const { token } = useAuth();
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedPermit, setSelectedPermit] = useState(null);
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
      setActionMessage(`Permit ${status}`);
      fetchPermits();
      setSelectedPermit(null);
    } catch (err) {
      alert(err.response?.data?.message || "Update failed.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="officer-permits">
      <h2>📜 Permit Requests</h2>
      <div className="filter-bar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="not_seen">Not Seen</option>
          <option value="in_progress">In Progress</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
        <button className="btn-refresh" onClick={fetchPermits}>
          🔄 Refresh
        </button>
      </div>
      {actionMessage && <div className="alert success">{actionMessage}</div>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Citizen</th>
            <th>Type</th>
            <th>Status</th>
            <th>Requested</th>
            <th>Warning</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {permits.map((p) => (
            <tr key={p._id}>
              <td>{p.citizenId?.full_name}</td>
              <td>{p.permitType}</td>
              <td>{p.status}</td>
              <td>{new Date(p.requestedAt).toLocaleDateString()}</td>
              <td>{p.warning ? "⚠️" : "✅"}</td>
              <td>
                <button
                  className="btn-edit"
                  onClick={() => setSelectedPermit(p)}
                >
                  Manage
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedPermit && (
        <div className="modal-overlay" onClick={() => setSelectedPermit(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Manage Permit</h3>
            <p>
              <strong>Citizen:</strong> {selectedPermit.citizenId?.full_name}
            </p>
            <p>
              <strong>Type:</strong> {selectedPermit.permitType}
            </p>
            <p>
              <strong>Form Data:</strong>{" "}
              <pre>{JSON.stringify(selectedPermit.formData, null, 2)}</pre>
            </p>
            <div className="form-group">
              <label>Rejection Reason (if rejecting)</label>
              <input
                type="text"
                placeholder="Reason..."
                onChange={(e) =>
                  setSelectedPermit({
                    ...selectedPermit,
                    rejectReason: e.target.value,
                  })
                }
              />
            </div>
            <div className="status-actions">
              <button
                className="btn-accept"
                onClick={() => updateStatus(selectedPermit._id, "accepted")}
              >
                Accept
              </button>
              <button
                className="btn-inprogress"
                onClick={() => updateStatus(selectedPermit._id, "in_progress")}
              >
                In Progress
              </button>
              <button
                className="btn-reject"
                onClick={() => {
                  const reason =
                    selectedPermit.rejectReason || "No reason provided";
                  updateStatus(selectedPermit._id, "rejected", reason);
                }}
              >
                Reject
              </button>
              <button
                className="btn-secondary"
                onClick={() => setSelectedPermit(null)}
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

export default OfficerPermits;
