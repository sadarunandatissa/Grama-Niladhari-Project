import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import "./CertificateComponents.css";
import { Home, TrendingUp, Award } from "lucide-react";

const TYPE_ICON = {
  residential: <Home className="w-5 h-5 text-gray-700" />,
  income: <TrendingUp className="w-5 h-5 text-emerald-600" />,
  character: <Award className="w-5 h-5 text-amber-500" />,
};

const STATUS_LABELS = {
  not_seen: "Not Seen",
  in_progress: "In Progress",
  completed: "Completed",
};

const STATUS_CLASS = {
  not_seen: "pending",
  in_progress: "processing",
  completed: "completed",
  rejected: "rejected",
};

const CitizenCertificateList = () => {
  const { token } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/certificate/my-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCertificates(res.data.data);
      } catch (err) {
        setError("Failed to load your certificate requests.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="cert-loading">Loading your certificate requests...</div>
    );
  if (error) return <div className="alert error">{error}</div>;

  return (
    <div className="certificate-requests">
      {certificates.length === 0 ? (
        <p className="cert-empty">
          You haven't requested any certificates yet.
        </p>
      ) : (
        <div className="certificate-grid">
          {certificates.map((cert) => (
            <div className="certificate-card" key={cert._id}>
              <div className="certificate-card-top">
                <div className="certificate-icon-box">
                  {TYPE_ICON[cert.certificateType] || "📄"}
                </div>
                <span
                  className={`status-badge ${STATUS_CLASS[cert.status] || "pending"}`}
                >
                  {STATUS_LABELS[cert.status] || cert.status}
                </span>
              </div>

              <div className="certificate-type-label">Type</div>
              <div className="certificate-type-value">
                {cert.certificateType.replace("_", " ").toUpperCase()}
              </div>

              {cert.status === "rejected" && cert.rejectionReason && (
                <div className="certificate-rejection-note">
                  Reason: {cert.rejectionReason}
                </div>
              )}

              <div className="certificate-card-footer">
                <div className="footer-item">
                  <span className="label">Request ID</span>
                  <span className="value">
                    #{cert._id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <div className="footer-item">
                  <span className="label">Date Requested</span>
                  <span className="value">
                    {new Date(cert.requestedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Link
                to={`/citizen/certificate/${cert._id}`}
                className="btn-view-details"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitizenCertificateList;
