import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./PendingVerifications.css";

const PendingVerifications = () => {
  const { token } = useAuth();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/registration/pending`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPending(response.data.data || []);
    } catch (error) {
      console.error("Error fetching pending:", error);
      setError("Failed to load pending registrations");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (requestId) => {
    if (!window.confirm("Are you sure you want to verify this registration?")) {
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/registration/verify/${requestId}`,
        { action: "verify" },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        setSuccess("Registration verified successfully!");
        fetchPending();
        setSelectedRequest(null);
        setTimeout(() => setSuccess(""), 5000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Verification failed");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleReject = async (requestId) => {
    if (!rejectReason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }

    if (!window.confirm("Are you sure you want to reject this registration?")) {
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/registration/verify/${requestId}`,
        {
          action: "reject",
          rejection_reason: rejectReason,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        setSuccess("Registration rejected successfully!");
        fetchPending();
        setSelectedRequest(null);
        setRejectReason("");
        setTimeout(() => setSuccess(""), 5000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Rejection failed");
      setTimeout(() => setError(""), 5000);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading pending registrations...</p>
      </div>
    );
  }

  return (
    <div className="pending-verifications">
      <div className="header">
        <div className="header-left">
          <h2>📋 Pending Registrations</h2>
          <span className="badge">{pending.length} pending</span>
        </div>
        <button className="btn-refresh" onClick={fetchPending}>
          🔄 Refresh
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {pending.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <p className="empty-title">All Clear!</p>
          <p className="empty-subtitle">No pending registrations to review.</p>
        </div>
      ) : (
        <div className="requests-grid">
          {pending.map((req) => (
            <div key={req._id} className="request-card">
              <div className="request-header">
                <div className="request-name">
                  <h3>{req.full_name}</h3>
                  <span
                    className={`role-badge ${req.is_family_head ? "head" : "member"}`}
                  >
                    {req.is_family_head ? "👑 Head" : "👤 Member"}
                  </span>
                </div>
                <span className="date-badge">
                  {new Date(req.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="request-details">
                <div className="detail-row">
                  <span className="label">NIC</span>
                  <span className="value">{req.nic}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Village</span>
                  <span className="value">{req.village}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Username</span>
                  <span className="value">{req.username}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone</span>
                  <span className="value">{req.phone_numbers.join(", ")}</span>
                </div>
                {!req.is_family_head && (
                  <div className="detail-row">
                    <span className="label">Family Reg No</span>
                    <span className="value highlight">{req.family_reg_no}</span>
                  </div>
                )}
                <div className="detail-row full">
                  <span className="label">Address</span>
                  <span className="value">{req.address}</span>
                </div>
              </div>

              <div className="request-actions">
                <button
                  className="btn-verify"
                  onClick={() => handleVerify(req._id)}
                >
                  ✓ Verify
                </button>
                <button
                  className="btn-reject"
                  onClick={() => setSelectedRequest(req._id)}
                >
                  ✗ Reject
                </button>
              </div>

              {selectedRequest === req._id && (
                <div className="reject-modal">
                  <div className="reject-header">
                    <span>Rejection Reason</span>
                    <button
                      className="close-modal"
                      onClick={() => {
                        setSelectedRequest(null);
                        setRejectReason("");
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <textarea
                    placeholder="Enter reason for rejection..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows="3"
                    autoFocus
                  />
                  <div className="modal-actions">
                    <button
                      className="btn-confirm-reject"
                      onClick={() => handleReject(req._id)}
                    >
                      Confirm Reject
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => {
                        setSelectedRequest(null);
                        setRejectReason("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingVerifications;
