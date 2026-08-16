import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const OfficerCertificateDetails = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/certificate/officer/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setCert(res.data.data);
        setStatus(res.data.data.status);
      } catch (err) {
        setError("Failed to load certificate details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      await axios.put(
        `${API_URL}/api/certificate/officer/update/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setStatus(newStatus);
      // Refresh
      const res = await axios.get(`${API_URL}/api/certificate/officer/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCert(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || "Update failed.");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!cert) return <div>Certificate not found</div>;

  const citizen = cert.citizen || {};
  const formData = cert.formData || {};
  const isResidential = cert.certificateType === "residential";
  const isIncome = cert.certificateType === "income";
  const isCharacter = cert.certificateType === "character";

  // Helper to render attachment preview
  const renderAttachment = (filePath, index) => {
    const fullUrl = `${API_URL}${filePath}`;
    const ext = filePath.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return (
        <img
          key={index}
          src={fullUrl}
          alt={`Attachment ${index + 1}`}
          className="attachment-img"
        />
      );
    } else if (ext === "pdf") {
      return (
        <div key={index} className="attachment-pdf">
          <a href={fullUrl} target="_blank" rel="noopener noreferrer">
            📄 View PDF
          </a>
        </div>
      );
    } else {
      return (
        <div key={index} className="attachment-other">
          <a href={fullUrl} target="_blank" rel="noopener noreferrer">
            📎 Download File
          </a>
        </div>
      );
    }
  };

  return (
    <div className="certificate-detail-container">
      <div className="detail-header">
        <h2>Certificate Request Details</h2>
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {/* Applicant Info Card */}
      <div className="applicant-card">
        <h3>Applicant Information</h3>
        <div className="applicant-grid">
          <div>
            <label>NIC</label>
            <span>{citizen.nic || "N/A"}</span>
          </div>
          <div>
            <label>First Name</label>
            <span>{citizen.first_name || formData.first_name || "N/A"}</span>
          </div>
          <div>
            <label>Middle Name</label>
            <span>{citizen.middle_name || formData.middle_name || "N/A"}</span>
          </div>
          <div>
            <label>Last Name</label>
            <span>{citizen.last_name || formData.last_name || "N/A"}</span>
          </div>
          <div>
            <label>Surname</label>
            <span>{citizen.surname || formData.surname || "N/A"}</span>
          </div>
          <div>
            <label>Address</label>
            <span>{citizen.address || formData.address || "N/A"}</span>
          </div>
          <div>
            <label>Telephone</label>
            <span>
              {citizen.phone_numbers?.[0] || formData.telephone || "N/A"}
            </span>
          </div>
          <div>
            <label>Email</label>
            <span>{citizen.email || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Certificate Type Specific Details */}
      <div className="cert-details-card">
        <h3>
          {cert.certificateType === "residential"
            ? "🏠 Residential Confirmation"
            : cert.certificateType === "income"
              ? "💰 Income Certificate"
              : "⭐ Character Certificate"}
        </h3>

        {isResidential && (
          <div className="specific-details">
            <div className="detail-row">
              <label>Reason:</label>
              <span>{formData.reason}</span>
            </div>
            <div className="detail-row">
              <label>Survey Number:</label>
              <span>{formData.survey_number || "N/A"}</span>
            </div>
            {cert.landDetails && (
              <div className="land-info">
                <h4>Linked Land Details</h4>
                <div className="detail-row">
                  <label>Land ID:</label>
                  <span>{cert.landDetails.land_id}</span>
                </div>
                <div className="detail-row">
                  <label>Size:</label>
                  <span>
                    {cert.landDetails.size.value} {cert.landDetails.size.unit}
                  </span>
                </div>
                <div className="detail-row">
                  <label>Type:</label>
                  <span>{cert.landDetails.type}</span>
                </div>
                <div className="detail-row">
                  <label>Owner Type:</label>
                  <span>{cert.landDetails.owner_type}</span>
                </div>
              </div>
            )}
            {formData.copy_of_bill && (
              <div className="attachment-section">
                <h4>Copy of Electricity/Water Bill</h4>
                {renderAttachment(formData.copy_of_bill, 0)}
              </div>
            )}
          </div>
        )}

        {isIncome && (
          <div className="specific-details">
            <div className="detail-row">
              <label>Annual Income:</label>
              <span>LKR {formData.anual_income || "N/A"}</span>
            </div>
            <div className="detail-row">
              <label>Reason:</label>
              <span>{formData.reason}</span>
            </div>
            {cert.lands && cert.lands.length > 0 ? (
              <div className="lands-table">
                <h4>Citizen's Lands</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Land ID</th>
                      <th>Survey No</th>
                      <th>Size</th>
                      <th>Type</th>
                      <th>Owner Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cert.lands.map((land) => (
                      <tr key={land._id}>
                        <td>{land.land_id}</td>
                        <td>{land.survey_number || "N/A"}</td>
                        <td>
                          {land.size.value} {land.size.unit}
                        </td>
                        <td>{land.type}</td>
                        <td>{land.owner_type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-lands">
                No property records found for this citizen.
              </div>
            )}
            {formData.plan_or_receipt && (
              <div className="attachment-section">
                <h4>Plan of Land / Pay Sheet Receipt</h4>
                {renderAttachment(formData.plan_or_receipt, 0)}
              </div>
            )}
          </div>
        )}

        {isCharacter && (
          <div className="specific-details">
            <div className="detail-row">
              <label>Reason:</label>
              <span>{formData.reason}</span>
            </div>
          </div>
        )}

        {/* All attachments from the request */}
        {cert.attachments && cert.attachments.length > 0 && (
          <div className="attachment-section">
            <h4>Supporting Documents</h4>
            <div className="attachments-grid">
              {cert.attachments.map((file, idx) => renderAttachment(file, idx))}
            </div>
          </div>
        )}
      </div>

      {/* Status Update */}
      <div className="status-section">
        <h4>Update Status</h4>
        <div className="status-controls">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="not_seen">Not Seen</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <button className="btn-update" onClick={() => updateStatus(status)}>
            Update Status
          </button>
        </div>
        <div className="current-status">
          Current:{" "}
          <span className={`status-${status}`}>{status.replace("_", " ")}</span>
        </div>
      </div>
    </div>
  );
};

export default OfficerCertificateDetails;
