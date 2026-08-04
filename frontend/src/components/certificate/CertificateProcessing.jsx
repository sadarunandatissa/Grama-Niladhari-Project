import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const CertificateProcessing = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [officerNotes, setOfficerNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/certificate/officer/pending`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setRequests(res.data.data);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId) => {
    if (!newStatus) {
      setMessage("Please select a status.");
      return;
    }
    try {
      await axios.put(
        `${API_URL}/api/certificate/officer/update/${requestId}`,
        {
          status: newStatus,
          officerNotes: officerNotes.trim(),
          generateCertificate: newStatus === "completed",
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessage(`✅ Request ${newStatus} successfully.`);
      setSelectedRequest(null);
      setOfficerNotes("");
      setNewStatus("");
      fetchRequests();
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Update failed."));
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();

  if (loading) return <div>Loading certificate requests...</div>;

  return (
    <div className="certificate-processing">
      <h3>Certificate Requests</h3>
      {message && <div className="alert info">{message}</div>}

      {requests.length === 0 ? (
        <p>No pending certificate requests.</p>
      ) : (
        <div className="requests-grid">
          {requests.map((req) => (
            <div key={req._id} className="request-card">
              <div className="request-header">
                <span className="tracking-id">{req.trackingId}</span>
                <span className="badge" style={{ background: "#f39c12" }}>
                  Pending
                </span>
              </div>
              <p>
                <strong>Type:</strong>{" "}
                {req.certificateType.replace("_", " ").toUpperCase()}
              </p>
              <p>
                <strong>Citizen:</strong> {req.citizenId?.full_name}
              </p>
              <p>
                <strong>NIC:</strong> {req.citizenId?.nic}
              </p>
              <p>
                <strong>Requested:</strong> {formatDate(req.requestDate)}
              </p>
              <p>
                <strong>Purpose:</strong> {req.purpose}
              </p>
              <button
                className="btn-process"
                onClick={() => setSelectedRequest(req)}
              >
                Process
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Process Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Process Certificate</h3>
            <p>
              <strong>Tracking ID:</strong> {selectedRequest.trackingId}
            </p>
            <p>
              <strong>Type:</strong> {selectedRequest.certificateType}
            </p>
            <p>
              <strong>Citizen:</strong> {selectedRequest.citizenId?.full_name}
            </p>
            <p>
              <strong>Purpose:</strong> {selectedRequest.purpose}
            </p>

            <div className="form-group">
              <label>Officer Notes</label>
              <textarea
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                placeholder="Add notes or reason for rejection..."
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Update Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="">Select...</option>
                <option value="processing">Processing</option>
                <option value="completed">
                  Completed (Generate Certificate)
                </option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="modal-actions">
              <button
                className="btn-primary"
                onClick={() => handleStatusUpdate(selectedRequest._id)}
              >
                Update
              </button>
              <button
                className="btn-secondary"
                onClick={() => setSelectedRequest(null)}
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

export default CertificateProcessing;
