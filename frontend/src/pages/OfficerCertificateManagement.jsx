import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // ← ADD THIS IMPORT
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const OfficerCertificateManagement = () => {
  const { token } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
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

  const filtered =
    statusFilter === "all"
      ? certificates
      : certificates.filter((c) => c.status === statusFilter);

  return (
    <div className="officer-certificate-management">
      <h2>📜 Certificate Requests</h2>
      {message && <div className="alert info">{message}</div>}

      <div className="filter-bar">
        <label>Filter by status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="not_seen">Not Seen</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button className="btn-refresh" onClick={fetchCertificates}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6">No certificate requests found.</td>
              </tr>
            ) : (
              filtered.map((cert) => (
                <tr key={cert._id}>
                  <td>{cert.citizenId?.full_name}</td>
                  <td>
                    {cert.certificateType.replace("_", " ").toUpperCase()}
                  </td>
                  <td>
                    <span className={`status-${cert.status}`}>
                      {cert.status.replace("_", " ")}
                    </span>
                  </td>
                  <td>{new Date(cert.requestedAt).toLocaleDateString()}</td>
                  <td>{cert.warning ? "⚠️" : "✅"}</td>
                  <td>
                    {/* ✅ ADD THE LINK TO DETAILS */}
                    <Link
                      to={`/officer/certificate/${cert._id}`}
                      className="btn-view"
                    >
                      View Details
                    </Link>
                    {/* Keep the status update button if you want, or use a separate modal */}
                    <button
                      className="btn-edit"
                      onClick={() => setSelectedCert(cert)}
                      style={{ marginLeft: "8px" }}
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Status update modal (unchanged) */}
      {selectedCert && (
        <div className="modal-overlay" onClick={() => setSelectedCert(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Update Certificate Status</h3>
            <p>
              <strong>Citizen:</strong> {selectedCert.citizenId?.full_name}
            </p>
            <p>
              <strong>Type:</strong> {selectedCert.certificateType}
            </p>
            <p>
              <strong>Current Status:</strong> {selectedCert.status}
            </p>
            <div className="form-group">
              <label>New Status</label>
              <select
                value={selectedCert.status}
                onChange={(e) =>
                  setSelectedCert({ ...selectedCert, status: e.target.value })
                }
              >
                <option value="not_seen">Not Seen</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="modal-actions">
              <button
                className="btn-primary"
                onClick={() => {
                  updateStatus(selectedCert._id, selectedCert.status);
                  setSelectedCert(null);
                }}
              >
                Update
              </button>
              <button
                className="btn-secondary"
                onClick={() => setSelectedCert(null)}
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

export default OfficerCertificateManagement;
