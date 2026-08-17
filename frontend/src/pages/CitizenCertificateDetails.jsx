import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./CitizenCertificateDetails.css";

const CitizenCertificateDetails = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/certificate/citizen/request/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setCert(res.data.data);
      } catch (err) {
        setError("Failed to load certificate details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, token]);

  const renderAttachment = (filePath, index) => {
    if (!filePath) return null;
    const fullUrl = filePath.startsWith("/uploads/")
      ? `${API_URL}${filePath}`
      : `${API_URL}/uploads/certificates/${filePath}`;
    const ext = filePath.split(".").pop().toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return (
        <div key={index} className="attachment-item">
          <img
            src={fullUrl}
            alt={`Attachment ${index + 1}`}
            className="attachment-img"
          />
          <a href={fullUrl} target="_blank" rel="noopener noreferrer">
            View
          </a>
        </div>
      );
    } else if (ext === "pdf") {
      return (
        <div key={index} className="attachment-item">
          <a href={fullUrl} target="_blank" rel="noopener noreferrer">
            📄 View PDF
          </a>
        </div>
      );
    } else {
      return (
        <div key={index} className="attachment-item">
          <a href={fullUrl} target="_blank" rel="noopener noreferrer">
            📎 Download
          </a>
        </div>
      );
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!cert) return <div>Certificate not found</div>;

  const formData = cert.formData || {};
  const statusColors = {
    not_seen: "#f39c12",
    in_progress: "#3498db",
    completed: "#27ae60",
    rejected: "#e74c3c",
  };

  return (
    <div className="citizen-certificate-details">
      <div className="detail-header">
        <h2>Certificate Request Details</h2>
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="cert-card">
        <div className="cert-type">
          {cert.certificateType === "residential" &&
            "🏠 Residential Confirmation"}
          {cert.certificateType === "income" && "💰 Income Certificate"}
          {cert.certificateType === "character" && "⭐ Character Certificate"}
        </div>
        <div className="cert-status">
          Status:{" "}
          <span
            style={{ color: statusColors[cert.status], fontWeight: "bold" }}
          >
            {cert.status.replace("_", " ").toUpperCase()}
          </span>
        </div>
        {cert.rejectionReason && (
          <div className="rejection-reason">
            <strong>Rejection Reason:</strong> {cert.rejectionReason}
          </div>
        )}
        <div className="cert-details">
          <p>
            <strong>Requested On:</strong>{" "}
            {new Date(cert.requestedAt).toLocaleDateString()}
          </p>
          <p>
            <strong>Purpose:</strong> {formData.reason || "N/A"}
          </p>
          {formData.survey_number && (
            <p>
              <strong>Survey Number:</strong> {formData.survey_number}
            </p>
          )}
          {formData.anual_income && (
            <p>
              <strong>Annual Income:</strong> LKR {formData.anual_income}
            </p>
          )}
        </div>
        {cert.attachments && cert.attachments.length > 0 && (
          <div className="attachments-section">
            <h4>Attachments</h4>
            <div className="attachments-grid">
              {cert.attachments.map((file, idx) => renderAttachment(file, idx))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenCertificateDetails;
