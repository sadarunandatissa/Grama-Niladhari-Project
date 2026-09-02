// src/components/permits/CitizenPermitList.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./CitizenPermitList.css";

const TYPE_ICON = {
  timber: "🌳",
  sand: "🏖️",
};

const TYPE_LABEL = {
  timber: "Timber Felling & Transport",
  sand: "Sand Mining & Transport",
};

const STATUS_LABELS = {
  not_seen: "Awaiting Review",
  in_progress: "Processing",
  accepted: "Accepted",
  rejected: "Rejected",
};

const STATUS_CLASS = {
  not_seen: "pending",
  in_progress: "processing",
  accepted: "completed",
  rejected: "rejected",
};

const CitizenPermitList = ({ refreshKey }) => {
  const { token } = useAuth();
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchPermits = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/permits/citizen/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPermits(res.data.data || []);
      setError("");
    } catch (err) {
      console.error("Failed to fetch permits:", err);
      setError("Failed to load your permit requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermits();
  }, [token, refreshKey]);

  if (loading) return <div className="cert-loading">Loading permits...</div>;
  if (error) return <div className="alert error">{error}</div>;

  return (
    <div className="permit-requests">
      {permits.length === 0 ? (
        <p className="cert-empty">No permit requests yet.</p>
      ) : (
        <div className="permit-grid">
          {permits.map((p) => (
            <div className="permit-card" key={p._id}>
              <div className="permit-card-top">
                <div className="permit-icon-box">
                  {TYPE_ICON[p.permitType] || "📄"}
                </div>
                <span
                  className={`status-badge ${STATUS_CLASS[p.status] || "pending"}`}
                >
                  {STATUS_LABELS[p.status] || p.status.replace("_", " ")}
                </span>
              </div>

              <div className="permit-type-label">Type</div>
              <div className="permit-type-value">
                {TYPE_LABEL[p.permitType] || p.permitType}
              </div>

              {p.status === "rejected" && p.rejectionReason && (
                <div className="permit-rejection-note">
                  Reason: {p.rejectionReason}
                </div>
              )}
              {p.status === "accepted" && (
                <div className="permit-info-note success">
                  ✅ Can collect at GN office
                </div>
              )}

              <div className="permit-card-footer">
                <div className="footer-item">
                  <span className="label">Request ID</span>
                  <span className="value">
                    #{p._id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <div className="footer-item">
                  <span className="label">Date Requested</span>
                  <span className="value">
                    {new Date(p.requestedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitizenPermitList;
