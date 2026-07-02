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
    return <div className="loading">Loading pending registrations...</div>;
  }

  return (
    <div className="pending-verifications">
      <div className="header">
        <h2>Pending Registrations</h2>
        <button className="btn-refresh" onClick={fetchPending}>
          🔄 Refresh
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {pending.length === 0 ? (
        <div className="empty-state">
          <p>No pending registrations</p>
          <p className="sub-text">All registrations have been processed.</p>
        </div>
      ) : (
        <div className="requests-grid">
          {pending.map((req) => (
            <div key={req._id} className="request-card">
              <div className="request-header">
                <h3>{req.full_name}</h3>
                <span
                  className={`status-badge ${req.is_family_head ? "head" : "member"}`}
                >
                  {req.is_family_head ? "👑 Family Head" : "👤 Family Member"}
                </span>
              </div>

              <div className="request-details">
                <p>
                  <strong>NIC:</strong> {req.nic}
                </p>
                <p>
                  <strong>Village:</strong> {req.village}
                </p>
                <p>
                  <strong>Username:</strong> {req.username}
                </p>
                <p>
                  <strong>Address:</strong> {req.address}
                </p>
                <p>
                  <strong>Phone:</strong> {req.phone_numbers.join(", ")}
                </p>
                {req.email && (
                  <p>
                    <strong>Email:</strong> {req.email}
                  </p>
                )}
                {!req.is_family_head && (
                  <p>
                    <strong>Family Reg No:</strong> {req.family_reg_no}
                  </p>
                )}
                <p>
                  <strong>Submitted:</strong>{" "}
                  {new Date(req.created_at).toLocaleString()}
                </p>
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
                  <textarea
                    placeholder="Enter rejection reason..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows="3"
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
