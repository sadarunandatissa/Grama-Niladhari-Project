import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./OfficerCertificateDetails.css";

const IconArrowLeft = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

const IconHome = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7" />
    <path d="M5 10v10a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V10" />
  </svg>
);

const IconIncome = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v10" />
    <path d="M14.5 9.5a2.5 2.5 0 0 0-2.5-1.5c-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2a2.5 2.5 0 0 1-2.5-1.5" />
  </svg>
);

const IconStar = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconEye = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconDownload = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3v12" />
    <path d="m7 10 5 5 5-5" />
    <path d="M5 21h14" />
  </svg>
);

const IconFile = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
  </svg>
);

const IconPaperclip = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.44 11.05 12.25 20.24a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95L10.13 17.1a2 2 0 0 1-2.83-2.83l8.49-8.49" />
  </svg>
);

const IconX = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const CERT_TYPE_META = {
  residential: { label: "Residential Confirmation", icon: <IconHome /> },
  income: { label: "Income Certificate", icon: <IconIncome /> },
  character: { label: "Character Certificate", icon: <IconStar /> },
};

const OfficerCertificateDetails = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

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
        if (res.data.data.rejectionReason) {
          setRejectReason(res.data.data.rejectionReason);
        }
      } catch (err) {
        setError("Failed to load certificate details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, token]);

  const updateStatus = async (newStatus, reason = "") => {
    try {
      const payload = { status: newStatus };
      if (newStatus === "rejected" && reason) {
        payload.rejectionReason = reason;
      }
      await axios.put(
        `${API_URL}/api/certificate/officer/update/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setStatus(newStatus);
      const res = await axios.get(`${API_URL}/api/certificate/officer/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCert(res.data.data);
      if (res.data.data.rejectionReason) {
        setRejectReason(res.data.data.rejectionReason);
      }
      setShowRejectForm(false);
    } catch (err) {
      alert(err.response?.data?.message || "Update failed.");
    }
  };

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
          <div className="attachment-actions">
            <a href={fullUrl} target="_blank" rel="noopener noreferrer">
              <IconEye /> View
            </a>
            <a href={fullUrl} download>
              <IconDownload /> Download
            </a>
          </div>
        </div>
      );
    } else if (ext === "pdf") {
      return (
        <div key={index} className="attachment-item">
          <div className="attachment-file-icon">
            <IconFile />
          </div>
          <span>Document {index + 1}</span>
          <div className="attachment-actions">
            <a href={fullUrl} target="_blank" rel="noopener noreferrer">
              <IconEye /> View
            </a>
            <a href={fullUrl} download>
              <IconDownload /> Download
            </a>
          </div>
        </div>
      );
    } else {
      return (
        <div key={index} className="attachment-item">
          <div className="attachment-file-icon">
            <IconPaperclip />
          </div>
          <span>File {index + 1}</span>
          <div className="attachment-actions">
            <a href={fullUrl} download>
              <IconDownload /> Download
            </a>
          </div>
        </div>
      );
    }
  };

  if (loading)
    return <div className="loading-state">Loading certificate details…</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!cert) return <div className="error-state">Certificate not found.</div>;

  const citizen = cert.citizen || {};
  const formData = cert.formData || {};
  const isResidential = cert.certificateType === "residential";
  const isIncome = cert.certificateType === "income";
  const isCharacter = cert.certificateType === "character";
  const typeMeta = CERT_TYPE_META[cert.certificateType];

  return (
    <div className="certificate-detail-container">
      <div className="detail-header">
        <h2>Certificate Request Details</h2>
        <button className="btn-back" onClick={() => navigate(-1)}>
          <IconArrowLeft /> Back
        </button>
      </div>

      <div className="detail-layout">
        {/* ---------- Main column ---------- */}
        <div className="detail-main">
          <div className="applicant-card">
            <h3>Applicant Information</h3>
            <div className="applicant-grid">
              <div>
                <label>NIC</label>
                <span>{citizen.nic || "N/A"}</span>
              </div>
              <div>
                <label>First Name</label>
                <span>
                  {citizen.first_name || formData.first_name || "N/A"}
                </span>
              </div>
              <div>
                <label>Middle Name</label>
                <span>
                  {citizen.middle_name || formData.middle_name || "N/A"}
                </span>
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

          <div className="cert-details-card">
            <h3 className="cert-type-heading">
              {typeMeta?.icon}
              {typeMeta?.label || "Certificate"}
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
                        {cert.landDetails.size.value}{" "}
                        {cert.landDetails.size.unit}
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

            {cert.attachments && cert.attachments.length > 0 && (
              <div className="attachment-section">
                <h4>Supporting Documents</h4>
                <div className="attachments-grid">
                  {cert.attachments.map((file, idx) =>
                    renderAttachment(file, idx),
                  )}
                </div>
              </div>
            )}
            {(!cert.attachments || cert.attachments.length === 0) && (
              <div className="no-attachments">No attachments uploaded.</div>
            )}
          </div>
        </div>

        {/* ---------- Sidebar ---------- */}
        <div className="detail-sidebar">
          <div className="sidebar-card quick-facts">
            <h4>Request Summary</h4>
            <div className="fact-row">
              <span className="fact-label">Type</span>
              <span className="fact-value">
                {cert.certificateType?.replace("_", " ")}
              </span>
            </div>
            {cert.requestedAt && (
              <div className="fact-row">
                <span className="fact-label">Requested</span>
                <span className="fact-value">
                  {new Date(cert.requestedAt).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="fact-row">
              <span className="fact-label">Current Status</span>
              <span className={`status-badge status-${status}`}>
                {status.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="sidebar-card status-section">
            <h4>Update Status</h4>

            {!showRejectForm ? (
              <div className="status-controls">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="not_seen">Not Seen</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button
                  className="btn-update"
                  onClick={() => updateStatus(status)}
                >
                  Update Status
                </button>
                {status !== "rejected" && (
                  <button
                    className="btn-danger"
                    onClick={() => setShowRejectForm(true)}
                  >
                    <IconX /> Reject Request
                  </button>
                )}
              </div>
            ) : (
              <div className="reject-form">
                <label>Rejection Reason *</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter the reason for rejecting this certificate request..."
                  rows="4"
                  required
                />
                <div className="reject-actions">
                  <button
                    className="btn-danger"
                    onClick={() => {
                      if (rejectReason.trim()) {
                        updateStatus("rejected", rejectReason);
                      } else {
                        alert("Please enter a rejection reason.");
                      }
                    }}
                  >
                    Confirm Reject
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectReason("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {cert.rejectionReason && (
              <div className="rejection-reason">
                <strong>Rejection Reason:</strong> {cert.rejectionReason}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerCertificateDetails;
