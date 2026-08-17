import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!cert) return <div>Certificate not found</div>;

  const formData = cert.formData || {};
  const isResidential = cert.certificateType === "residential";
  const isIncome = cert.certificateType === "income";
  const isCharacter = cert.certificateType === "character";

  return (
    <div className="citizen-cert-detail">
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h2>Certificate Request Details</h2>

      <div className="cert-info">
        <p>
          <strong>Type:</strong>{" "}
          {cert.certificateType.replace("_", " ").toUpperCase()}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span className={`status-${cert.status}`}>
            {cert.status.replace("_", " ")}
          </span>
        </p>
        <p>
          <strong>Requested On:</strong>{" "}
          {new Date(cert.requestedAt).toLocaleString()}
        </p>
        {cert.status === "rejected" && cert.rejectionReason && (
          <div className="rejection-box">
            <strong>Rejection Reason:</strong> {cert.rejectionReason}
          </div>
        )}
        {cert.status === "completed" && (
          <div className="completion-box">
            <p>
              ✅ Your certificate is ready. Please collect it at the GN office.
            </p>
          </div>
        )}
      </div>

      <div className="form-details">
        <h4>Submitted Information</h4>
        <div className="detail-row">
          <label>NIC:</label>
          <span>{formData.nic}</span>
        </div>
        <div className="detail-row">
          <label>Name:</label>
          <span>
            {formData.first_name} {formData.middle_name} {formData.last_name}
          </span>
        </div>
        <div className="detail-row">
          <label>Address:</label>
          <span>{formData.address}</span>
        </div>
        <div className="detail-row">
          <label>Telephone:</label>
          <span>{formData.telephone}</span>
        </div>
        <div className="detail-row">
          <label>Reason:</label>
          <span>{formData.reason}</span>
        </div>
        {isResidential && (
          <div className="detail-row">
            <label>Survey Number:</label>
            <span>{formData.survey_number}</span>
          </div>
        )}
        {isIncome && (
          <div className="detail-row">
            <label>Annual Income:</label>
            <span>LKR {formData.anual_income}</span>
          </div>
        )}
      </div>

      {cert.attachments && cert.attachments.length > 0 && (
        <div className="attachments">
          <h4>Supporting Documents</h4>
          <ul>
            {cert.attachments.map((file, idx) => (
              <li key={idx}>
                <a
                  href={`${API_URL}${file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Document {idx + 1}
                </a>
                <a href={`${API_URL}${file}`} download>
                  {" "}
                  Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CitizenCertificateDetails;
