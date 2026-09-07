// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";

// const OfficerCertificateDetails = () => {
//   const { id } = useParams();
//   const { token } = useAuth();
//   const navigate = useNavigate();

//   // ─── State ──────────────────────────────────────────────
//   const [cert, setCert] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [status, setStatus] = useState("");
//   const [showRejectForm, setShowRejectForm] = useState(false);
//   const [rejectReason, setRejectReason] = useState("");

//   const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

//   // ─── Fetch Details ──────────────────────────────────────
//   useEffect(() => {
//     const fetchDetails = async () => {
//       try {
//         const res = await axios.get(
//           `${API_URL}/api/certificate/officer/${id}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           },
//         );
//         setCert(res.data.data);
//         setStatus(res.data.data.status);
//         // If already rejected, show the reason
//         if (res.data.data.rejectionReason) {
//           setRejectReason(res.data.data.rejectionReason);
//         }
//       } catch (err) {
//         setError("Failed to load certificate details.");
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchDetails();
//   }, [id, token]);

//   // ─── Update Status (with optional rejection reason) ────
//   const updateStatus = async (newStatus, reason = "") => {
//     try {
//       const payload = { status: newStatus };
//       if (newStatus === "rejected" && reason) {
//         payload.rejectionReason = reason;
//       }
//       await axios.put(
//         `${API_URL}/api/certificate/officer/update/${id}`,
//         payload,
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//       setStatus(newStatus);
//       // Refresh details
//       const res = await axios.get(`${API_URL}/api/certificate/officer/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setCert(res.data.data);
//       if (res.data.data.rejectionReason) {
//         setRejectReason(res.data.data.rejectionReason);
//       }
//       // Close reject form if open
//       setShowRejectForm(false);
//     } catch (err) {
//       alert(err.response?.data?.message || "Update failed.");
//     }
//   };

//   // ─── Render Attachment ──────────────────────────────────
//   const renderAttachment = (filePath, index) => {
//     if (!filePath) return null;
//     const fullUrl = filePath.startsWith("/uploads/")
//       ? `${API_URL}${filePath}`
//       : `${API_URL}/uploads/certificates/${filePath}`;
//     const ext = filePath.split(".").pop().toLowerCase();

//     if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
//       return (
//         <div key={index} className="attachment-item">
//           <img
//             src={fullUrl}
//             alt={`Attachment ${index + 1}`}
//             className="attachment-img"
//           />
//           <div className="attachment-actions">
//             <a href={fullUrl} target="_blank" rel="noopener noreferrer">
//               👁️ View
//             </a>
//             <a href={fullUrl} download>
//               ⬇️ Download
//             </a>
//           </div>
//         </div>
//       );
//     } else if (ext === "pdf") {
//       return (
//         <div key={index} className="attachment-item">
//           <div className="attachment-pdf-icon">📄</div>
//           <span>Document {index + 1}</span>
//           <div className="attachment-actions">
//             <a href={fullUrl} target="_blank" rel="noopener noreferrer">
//               👁️ View
//             </a>
//             <a href={fullUrl} download>
//               ⬇️ Download
//             </a>
//           </div>
//         </div>
//       );
//     } else {
//       return (
//         <div key={index} className="attachment-item">
//           <div className="attachment-other-icon">📎</div>
//           <span>File {index + 1}</span>
//           <div className="attachment-actions">
//             <a href={fullUrl} download>
//               ⬇️ Download
//             </a>
//           </div>
//         </div>
//       );
//     }
//   };

//   // ─── Loading / Error ────────────────────────────────────
//   if (loading) return <div className="loading">Loading...</div>;
//   if (error) return <div className="error">{error}</div>;
//   if (!cert) return <div>Certificate not found</div>;

//   const citizen = cert.citizen || {};
//   const formData = cert.formData || {};
//   const isResidential = cert.certificateType === "residential";
//   const isIncome = cert.certificateType === "income";
//   const isCharacter = cert.certificateType === "character";

//   // ─── Render ──────────────────────────────────────────────
//   return (
//     <div className="certificate-detail-container">
//       <div className="detail-header">
//         <h2>Certificate Request Details</h2>
//         <button className="btn-back" onClick={() => navigate(-1)}>
//           ← Back
//         </button>
//       </div>

//       {/* Applicant Info Card */}
//       <div className="applicant-card">
//         <h3>Applicant Information</h3>
//         <div className="applicant-grid">
//           <div>
//             <label>NIC</label>
//             <span>{citizen.nic || "N/A"}</span>
//           </div>
//           <div>
//             <label>First Name</label>
//             <span>{citizen.first_name || formData.first_name || "N/A"}</span>
//           </div>
//           <div>
//             <label>Middle Name</label>
//             <span>{citizen.middle_name || formData.middle_name || "N/A"}</span>
//           </div>
//           <div>
//             <label>Last Name</label>
//             <span>{citizen.last_name || formData.last_name || "N/A"}</span>
//           </div>
//           <div>
//             <label>Surname</label>
//             <span>{citizen.surname || formData.surname || "N/A"}</span>
//           </div>
//           <div>
//             <label>Address</label>
//             <span>{citizen.address || formData.address || "N/A"}</span>
//           </div>
//           <div>
//             <label>Telephone</label>
//             <span>
//               {citizen.phone_numbers?.[0] || formData.telephone || "N/A"}
//             </span>
//           </div>
//           <div>
//             <label>Email</label>
//             <span>{citizen.email || "N/A"}</span>
//           </div>
//         </div>
//       </div>

//       {/* Certificate Specific Details */}
//       <div className="cert-details-card">
//         <h3>
//           {isResidential && "🏠 Residential Confirmation"}
//           {isIncome && "💰 Income Certificate"}
//           {isCharacter && "⭐ Character Certificate"}
//         </h3>

//         {isResidential && (
//           <div className="specific-details">
//             <div className="detail-row">
//               <label>Reason:</label>
//               <span>{formData.reason}</span>
//             </div>
//             <div className="detail-row">
//               <label>Survey Number:</label>
//               <span>{formData.survey_number || "N/A"}</span>
//             </div>
//             {cert.landDetails && (
//               <div className="land-info">
//                 <h4>Linked Land Details</h4>
//                 <div className="detail-row">
//                   <label>Land ID:</label>
//                   <span>{cert.landDetails.land_id}</span>
//                 </div>
//                 <div className="detail-row">
//                   <label>Size:</label>
//                   <span>
//                     {cert.landDetails.size.value} {cert.landDetails.size.unit}
//                   </span>
//                 </div>
//                 <div className="detail-row">
//                   <label>Type:</label>
//                   <span>{cert.landDetails.type}</span>
//                 </div>
//                 <div className="detail-row">
//                   <label>Owner Type:</label>
//                   <span>{cert.landDetails.owner_type}</span>
//                 </div>
//               </div>
//             )}
//             {formData.copy_of_bill && (
//               <div className="attachment-section">
//                 <h4>Copy of Electricity/Water Bill</h4>
//                 {renderAttachment(formData.copy_of_bill, 0)}
//               </div>
//             )}
//           </div>
//         )}

//         {isIncome && (
//           <div className="specific-details">
//             <div className="detail-row">
//               <label>Annual Income:</label>
//               <span>LKR {formData.anual_income || "N/A"}</span>
//             </div>
//             <div className="detail-row">
//               <label>Reason:</label>
//               <span>{formData.reason}</span>
//             </div>
//             {cert.lands && cert.lands.length > 0 ? (
//               <div className="lands-table">
//                 <h4>Citizen's Lands</h4>
//                 <table>
//                   <thead>
//                     <tr>
//                       <th>Land ID</th>
//                       <th>Survey No</th>
//                       <th>Size</th>
//                       <th>Type</th>
//                       <th>Owner Type</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {cert.lands.map((land) => (
//                       <tr key={land._id}>
//                         <td>{land.land_id}</td>
//                         <td>{land.survey_number || "N/A"}</td>
//                         <td>
//                           {land.size.value} {land.size.unit}
//                         </td>
//                         <td>{land.type}</td>
//                         <td>{land.owner_type}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             ) : (
//               <div className="no-lands">
//                 No property records found for this citizen.
//               </div>
//             )}
//             {formData.plan_or_receipt && (
//               <div className="attachment-section">
//                 <h4>Plan of Land / Pay Sheet Receipt</h4>
//                 {renderAttachment(formData.plan_or_receipt, 0)}
//               </div>
//             )}
//           </div>
//         )}

//         {isCharacter && (
//           <div className="specific-details">
//             <div className="detail-row">
//               <label>Reason:</label>
//               <span>{formData.reason}</span>
//             </div>
//           </div>
//         )}

//         {/* Attachments */}
//         {cert.attachments && cert.attachments.length > 0 && (
//           <div className="attachment-section">
//             <h4>Supporting Documents</h4>
//             <div className="attachments-grid">
//               {cert.attachments.map((file, idx) => renderAttachment(file, idx))}
//             </div>
//           </div>
//         )}
//         {(!cert.attachments || cert.attachments.length === 0) && (
//           <div className="no-attachments">No attachments uploaded.</div>
//         )}

//         {/* ─── Show Rejection Reason if present ────────────── */}
//         {cert.rejectionReason && (
//           <div className="rejection-reason">
//             <strong>Rejection Reason:</strong> {cert.rejectionReason}
//           </div>
//         )}
//       </div>

//       {/* ─── Status Update Section ─────────────────────────── */}
//       <div className="status-section">
//         <h4>Update Status</h4>

//         {!showRejectForm ? (
//           <div className="status-controls">
//             <select value={status} onChange={(e) => setStatus(e.target.value)}>
//               <option value="not_seen">Not Seen</option>
//               <option value="in_progress">In Progress</option>
//               <option value="completed">Completed</option>
//               <option value="rejected">Rejected</option>
//             </select>
//             <button className="btn-update" onClick={() => updateStatus(status)}>
//               Update Status
//             </button>
//             {/* Reject Button – only show if not already rejected */}
//             {status !== "rejected" && (
//               <button
//                 className="btn-danger"
//                 onClick={() => setShowRejectForm(true)}
//               >
//                 ❌ Reject
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="reject-form">
//             <label>Rejection Reason *</label>
//             <textarea
//               value={rejectReason}
//               onChange={(e) => setRejectReason(e.target.value)}
//               placeholder="Enter the reason for rejecting this certificate request..."
//               rows="4"
//               required
//             />
//             <div className="reject-actions">
//               <button
//                 className="btn-danger"
//                 onClick={() => {
//                   if (rejectReason.trim()) {
//                     updateStatus("rejected", rejectReason);
//                   } else {
//                     alert("Please enter a rejection reason.");
//                   }
//                 }}
//               >
//                 Confirm Reject
//               </button>
//               <button
//                 className="btn-secondary"
//                 onClick={() => {
//                   setShowRejectForm(false);
//                   setRejectReason("");
//                 }}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         )}

//         <div className="current-status">
//           Current:{" "}
//           <span className={`status-${status}`}>{status.replace("_", " ")}</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OfficerCertificateDetails;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./OfficerCertificateDetails.css";

const CertificateRequests = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  // =========================================================
  // LIST PAGE STATE
  // =========================================================

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // =========================================================
  // DETAILS PAGE STATE
  // =========================================================

  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const [status, setStatus] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // =========================================================
  // FETCH REQUESTS
  // =========================================================

  useEffect(() => {
    fetchRequests();
  }, [token]);

  const fetchRequests = async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        `${API_URL}/api/certificate/officer`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests(res.data.data || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load certificate requests.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // OPEN CERTIFICATE DETAILS
  // =========================================================

  const openCertificateDetails = async (id) => {
    setDetailsLoading(true);
    setDetailsError("");
    setSelectedCertificate(null);

    try {
      const res = await axios.get(
        `${API_URL}/api/certificate/officer/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const certificate = res.data.data;

      setSelectedCertificate(certificate);
      setStatus(certificate.status);

      if (certificate.rejectionReason) {
        setRejectReason(certificate.rejectionReason);
      } else {
        setRejectReason("");
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(err);
      setDetailsError("Failed to load certificate details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  // =========================================================
  // BACK TO REQUEST LIST
  // =========================================================

  const backToRequests = () => {
    setSelectedCertificate(null);
    setDetailsError("");
    setShowRejectForm(false);
    setRejectReason("");
  };

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const updateStatus = async (newStatus, reason = "") => {
    if (!selectedCertificate) return;

    try {
      const payload = {
        status: newStatus,
      };

      if (newStatus === "rejected" && reason) {
        payload.rejectionReason = reason;
      }

      await axios.put(
        `${API_URL}/api/certificate/officer/update/${selectedCertificate._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStatus(newStatus);

      // Refresh selected certificate
      const res = await axios.get(
        `${API_URL}/api/certificate/officer/${selectedCertificate._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedCertificate(res.data.data);

      if (res.data.data.rejectionReason) {
        setRejectReason(res.data.data.rejectionReason);
      }

      setShowRejectForm(false);

      // Refresh request list too
      fetchRequests();

    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Failed to update certificate status."
      );
    }
  };

  // =========================================================
  // FILTER & SEARCH
  // =========================================================

  const filteredRequests = requests.filter((req) => {
    const statusMatch =
      filterStatus === "all" ||
      req.status === filterStatus;

    const search = searchTerm.toLowerCase();

    const searchMatch =
      req.citizen?.first_name
        ?.toLowerCase()
        .includes(search) ||
      req.citizen?.last_name
        ?.toLowerCase()
        .includes(search) ||
      req.citizen?.nic
        ?.toLowerCase()
        .includes(search);

    return statusMatch && searchMatch;
  });

  // =========================================================
  // HELPER FUNCTIONS
  // =========================================================

  const getStatusBadge = (statusValue) => {
    switch (statusValue) {
      case "completed":
        return (
          <span className="status-badge status-completed">
            completed
          </span>
        );

      case "in_progress":
        return (
          <span className="status-badge status-in-progress">
            in progress
          </span>
        );

      case "not_seen":
        return (
          <span className="status-badge status-not-seen">
            not seen
          </span>
        );

      case "rejected":
        return (
          <span className="status-badge status-rejected">
            rejected
          </span>
        );

      default:
        return (
          <span className="status-badge">
            {statusValue}
          </span>
        );
    }
  };

  const getWarningIcon = (req) => {
    if (req.status === "not_seen") {
      return <span className="warning-icon">⚠️</span>;
    }

    if (req.status === "completed") {
      return <span className="check-icon">✓</span>;
    }

    return null;
  };

  const getCertTypeIcon = (type) => {
    switch (type) {
      case "residential":
        return "🏠";

      case "income":
        return "💰";

      case "character":
        return "⭐";

      default:
        return "📄";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    );
  };

  const getFullName = (citizen) => {
    if (!citizen) return "N/A";

    return (
      `${citizen.first_name || ""} ${
        citizen.last_name || ""
      }`.trim() || "N/A"
    );
  };

  // =========================================================
  // ATTACHMENT
  // =========================================================

  const renderAttachment = (filePath, index) => {
    if (!filePath) return null;

    const fullUrl = filePath.startsWith("/uploads/")
      ? `${API_URL}${filePath}`
      : `${API_URL}/uploads/certificates/${filePath}`;

    const ext = filePath
      .split(".")
      .pop()
      .toLowerCase();

    if (
      ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
    ) {
      return (
        <div
          key={index}
          className="attachment-item"
        >
          <img
            src={fullUrl}
            alt={`Attachment ${index + 1}`}
            className="attachment-img"
          />

          <div className="attachment-actions">
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              👁️ View
            </a>

            <a href={fullUrl} download>
              ⬇️ Download
            </a>
          </div>
        </div>
      );
    }

    if (ext === "pdf") {
      return (
        <div
          key={index}
          className="attachment-item"
        >
          <div className="attachment-pdf-icon">
            📄
          </div>

          <span>
            Document {index + 1}
          </span>

          <div className="attachment-actions">
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              👁️ View
            </a>

            <a href={fullUrl} download>
              ⬇️ Download
            </a>
          </div>
        </div>
      );
    }

    return (
      <div
        key={index}
        className="attachment-item"
      >
        <div className="attachment-other-icon">
          📎
        </div>

        <span>
          File {index + 1}
        </span>

        <div className="attachment-actions">
          <a href={fullUrl} download>
            ⬇️ Download
          </a>
        </div>
      </div>
    );
  };

  // =========================================================
  // STATUS BADGE FOR DETAILS
  // =========================================================

  const getStatusBadgeClass = (statusValue) => {
    switch (statusValue) {
      case "completed":
        return "status-badge status-completed";

      case "in_progress":
        return "status-badge status-in-progress";

      case "not_seen":
        return "status-badge status-not-seen";

      case "rejected":
        return "status-badge status-rejected";

      default:
        return "status-badge";
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading && !selectedCertificate) {
    return (
      <div className="certificate-list-container">
        <div className="loading-spinner">
          Loading...
        </div>
      </div>
    );
  }

  // =========================================================
  // DETAILS PAGE
  // =========================================================

  if (selectedCertificate) {
    const cert = selectedCertificate;

    const citizen = cert.citizen || {};
    const formData = cert.formData || {};

    const isResidential =
      cert.certificateType === "residential";

    const isIncome =
      cert.certificateType === "income";

    const isCharacter =
      cert.certificateType === "character";

    return (
      <div className="certificate-detail-container">

        {/* HEADER */}

        <div className="detail-header">
          <div className="header-content">

            <button
              className="btn-back"
              onClick={backToRequests}
            >
              ← Back to Requests
            </button>

            <h1>
              Certificate Request Details
            </h1>

          </div>
        </div>

        {detailsError && (
          <div className="error-message">
            {detailsError}
          </div>
        )}

        <div className="detail-content">

          {/* APPLICANT INFORMATION */}

          <div className="info-card">

            <h2>
              👤 Applicant Information
            </h2>

            <div className="info-grid">

              <div className="info-item">
                <label>NIC</label>
                <span>
                  {citizen.nic || "N/A"}
                </span>
              </div>

              <div className="info-item">
                <label>First Name</label>
                <span>
                  {citizen.first_name ||
                    formData.first_name ||
                    "N/A"}
                </span>
              </div>

              <div className="info-item">
                <label>Middle Name</label>
                <span>
                  {citizen.middle_name ||
                    formData.middle_name ||
                    "N/A"}
                </span>
              </div>

              <div className="info-item">
                <label>Last Name</label>
                <span>
                  {citizen.last_name ||
                    formData.last_name ||
                    "N/A"}
                </span>
              </div>

              <div className="info-item">
                <label>Surname</label>
                <span>
                  {citizen.surname ||
                    formData.surname ||
                    "N/A"}
                </span>
              </div>

              <div className="info-item">
                <label>Address</label>
                <span>
                  {citizen.address ||
                    formData.address ||
                    "N/A"}
                </span>
              </div>

              <div className="info-item">
                <label>Telephone</label>
                <span>
                  {citizen.phone_numbers?.[0] ||
                    formData.telephone ||
                    "N/A"}
                </span>
              </div>

              <div className="info-item">
                <label>Email</label>
                <span>
                  {citizen.email || "N/A"}
                </span>
              </div>

            </div>
          </div>

          {/* CERTIFICATE DETAILS */}

          <div className="info-card">

            <h2>
              {isResidential &&
                "🏠 Residential Confirmation"}

              {isIncome &&
                "💰 Income Certificate"}

              {isCharacter &&
                "⭐ Character Certificate"}
            </h2>

            <div className="cert-details">

              {/* RESIDENTIAL */}

              {isResidential && (
                <>
                  <div className="detail-row">
                    <label>Reason:</label>
                    <span>
                      {formData.reason || "N/A"}
                    </span>
                  </div>

                  <div className="detail-row">
                    <label>
                      Survey Number:
                    </label>

                    <span>
                      {formData.survey_number ||
                        "N/A"}
                    </span>
                  </div>

                  {cert.landDetails && (
                    <div className="land-section">

                      <h3>
                        Linked Land Details
                      </h3>

                      <div className="detail-row">
                        <label>Land ID:</label>
                        <span>
                          {cert.landDetails.land_id}
                        </span>
                      </div>

                      <div className="detail-row">
                        <label>Size:</label>
                        <span>
                          {
                            cert.landDetails.size
                              ?.value
                          }{" "}
                          {
                            cert.landDetails.size
                              ?.unit
                          }
                        </span>
                      </div>

                      <div className="detail-row">
                        <label>Type:</label>
                        <span>
                          {cert.landDetails.type}
                        </span>
                      </div>

                      <div className="detail-row">
                        <label>
                          Owner Type:
                        </label>
                        <span>
                          {
                            cert.landDetails
                              .owner_type
                          }
                        </span>
                      </div>

                    </div>
                  )}

                  {formData.copy_of_bill && (
                    <div className="attachment-section">

                      <h3>
                        Copy of
                        Electricity/Water Bill
                      </h3>

                      <div className="attachments-grid">
                        {renderAttachment(
                          formData.copy_of_bill,
                          0
                        )}
                      </div>

                    </div>
                  )}
                </>
              )}

              {/* INCOME */}

              {isIncome && (
                <>
                  <div className="detail-row">
                    <label>
                      Annual Income:
                    </label>

                    <span>
                      LKR{" "}
                      {formData.anual_income ||
                        "N/A"}
                    </span>
                  </div>

                  <div className="detail-row">
                    <label>Reason:</label>

                    <span>
                      {formData.reason ||
                        "N/A"}
                    </span>
                  </div>

                  {cert.lands &&
                  cert.lands.length > 0 ? (
                    <div className="lands-section">

                      <h3>
                        Citizen's Lands
                      </h3>

                      <table className="lands-table">

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
                          {cert.lands.map(
                            (land) => (
                              <tr
                                key={land._id}
                              >
                                <td>
                                  {land.land_id}
                                </td>

                                <td>
                                  {
                                    land.survey_number
                                  }
                                </td>

                                <td>
                                  {
                                    land.size
                                      ?.value
                                  }{" "}
                                  {
                                    land.size
                                      ?.unit
                                  }
                                </td>

                                <td>
                                  {land.type}
                                </td>

                                <td>
                                  {
                                    land.owner_type
                                  }
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>

                      </table>
                    </div>
                  ) : (
                    <div className="no-data">
                      No property records
                      found for this
                      citizen.
                    </div>
                  )}

                  {formData.plan_or_receipt && (
                    <div className="attachment-section">

                      <h3>
                        Plan of Land / Pay
                        Sheet Receipt
                      </h3>

                      <div className="attachments-grid">
                        {renderAttachment(
                          formData.plan_or_receipt,
                          0
                        )}
                      </div>

                    </div>
                  )}
                </>
              )}

              {/* CHARACTER */}

              {isCharacter && (
                <div className="detail-row">

                  <label>
                    Reason:
                  </label>

                  <span>
                    {formData.reason ||
                      "N/A"}
                  </span>

                </div>
              )}

            </div>

            {/* SUPPORTING DOCUMENTS */}

            {cert.attachments &&
              cert.attachments.length > 0 && (
                <div className="attachment-section">

                  <h3>
                    Supporting Documents
                  </h3>

                  <div className="attachments-grid">

                    {cert.attachments.map(
                      (file, idx) =>
                        renderAttachment(
                          file,
                          idx
                        )
                    )}

                  </div>

                </div>
              )}

            {!cert.attachments ||
              (cert.attachments.length === 0 && (
                <div className="no-data">
                  No attachments
                  uploaded.
                </div>
              ))}

            {/* REJECTION REASON */}

            {cert.rejectionReason && (
              <div className="rejection-alert">

                <strong>
                  ⚠️ Rejection Reason:
                </strong>

                <p>
                  {cert.rejectionReason}
                </p>

              </div>
            )}

          </div>

          {/* STATUS MANAGEMENT */}

          <div className="status-card">

            <h2>
              Status Management
            </h2>

            <div className="current-status-display">

              <span className="status-label">
                Current Status:
              </span>

              <span
                className={getStatusBadgeClass(
                  status
                )}
              >
                {status
                  .replace("_", " ")
                  .toUpperCase()}
              </span>

            </div>

            {!showRejectForm ? (
              <div className="status-controls">

                <div className="control-group">

                  <label htmlFor="status-select">
                    Update Status:
                  </label>

                  <select
                    id="status-select"
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value
                      )
                    }
                    className="status-select"
                  >
                    <option value="not_seen">
                      Not Seen
                    </option>

                    <option value="in_progress">
                      In Progress
                    </option>

                    <option value="completed">
                      Completed
                    </option>

                    <option value="rejected">
                      Rejected
                    </option>
                  </select>

                </div>

                <div className="button-group">

                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      updateStatus(status)
                    }
                  >
                    ✓ Update Status
                  </button>

                  {status !== "rejected" && (
                    <button
                      className="btn btn-danger"
                      onClick={() =>
                        setShowRejectForm(
                          true
                        )
                      }
                    >
                      ✕ Reject Request
                    </button>
                  )}

                </div>

              </div>
            ) : (
              <div className="reject-form">

                <div className="form-group">

                  <label htmlFor="reject-reason">
                    Rejection Reason *
                  </label>

                  <textarea
                    id="reject-reason"
                    value={rejectReason}
                    onChange={(e) =>
                      setRejectReason(
                        e.target.value
                      )
                    }
                    placeholder="Enter the reason for rejecting this certificate request..."
                    rows="5"
                    className="form-textarea"
                  />

                </div>

                <div className="button-group">

                  <button
                    className="btn btn-danger"
                    onClick={() => {

                      if (
                        rejectReason.trim()
                      ) {
                        updateStatus(
                          "rejected",
                          rejectReason
                        );
                      } else {
                        alert(
                          "Please enter a rejection reason."
                        );
                      }

                    }}
                  >
                    ✓ Confirm Rejection
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowRejectForm(
                        false
                      );
                      setRejectReason("");
                    }}
                  >
                    ✕ Cancel
                  </button>

                </div>

              </div>
            )}

          </div>

        </div>
      </div>
    );
  }

  // =========================================================
  // REQUEST LIST PAGE
  // =========================================================

  return (
    <div className="certificate-list-container">

      {/* HEADER */}

      <div className="list-header">

        <div className="header-top">

          <div className="title-section">

            <div className="title-icon">
              📋
            </div>

            <h1>
              Certificate Requests
            </h1>

          </div>

          <div className="header-actions">

            <div className="search-box">

              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                className="search-input"
              />

              <span className="search-icon">
                🔍
              </span>

            </div>

            <button
              className="btn-refresh"
              onClick={fetchRequests}
            >
              🔄 Refresh
            </button>

          </div>

        </div>

        <div className="header-bottom">

          <div className="filter-section">

            <label htmlFor="status-filter">
              Filter by status:
            </label>

            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value
                )
              }
              className="filter-select"
            >
              <option value="all">
                All
              </option>

              <option value="not_seen">
                Not Seen
              </option>

              <option value="in_progress">
                In Progress
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="rejected">
                Rejected
              </option>
            </select>

          </div>

          <div className="results-count">
            Showing{" "}
            {filteredRequests.length} of{" "}
            {requests.length} requests
          </div>

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="error-alert">

          <span className="error-icon">
            ⚠️
          </span>

          <span>
            {error}
          </span>

          <button
            className="error-dismiss"
            onClick={() =>
              setError("")
            }
          >
            ✕
          </button>

        </div>
      )}

      {/* TABLE */}

      <div className="table-container">

        {filteredRequests.length > 0 ? (
          <table className="requests-table">

            <thead>

              <tr>
                <th className="col-citizen">
                  CITIZEN
                </th>

                <th className="col-type">
                  TYPE
                </th>

                <th className="col-status">
                  STATUS
                </th>

                <th className="col-requested">
                  REQUESTED
                </th>

                <th className="col-warning">
                  WARNING
                </th>

                <th className="col-actions">
                  ACTIONS
                </th>
              </tr>

            </thead>

            <tbody>

              {filteredRequests.map(
                (req) => (
                  <tr
                    key={req._id}
                    className={`status-${req.status}`}
                  >

                    <td className="col-citizen">

                      <div className="citizen-info">

                        <div className="citizen-name">
                          {getFullName(
                            req.citizen
                          )}
                        </div>

                        <div className="citizen-nic">
                          {
                            req.citizen
                              ?.nic ||
                            "N/A"
                          }
                        </div>

                      </div>

                    </td>

                    <td className="col-type">

                      <div className="type-badge">

                        <span className="type-icon">
                          {getCertTypeIcon(
                            req.certificateType
                          )}
                        </span>

                        <span className="type-name">
                          {req.certificateType
                            ?.toUpperCase() ||
                            "N/A"}
                        </span>

                      </div>

                    </td>

                    <td className="col-status">
                      {getStatusBadge(
                        req.status
                      )}
                    </td>

                    <td className="col-requested">
                      {formatDate(
                        req.createdAt
                      )}
                    </td>

                    <td className="col-warning">

                      <div className="warning-cell">
                        {getWarningIcon(
                          req
                        )}
                      </div>

                    </td>

                    <td className="col-actions">

                      <div className="actions-group">

                        <button
                          className="btn-link"
                          onClick={() =>
                            openCertificateDetails(
                              req._id
                            )
                          }
                        >
                          View Details
                        </button>

                        <button
                          className="btn-update"
                          onClick={() =>
                            openCertificateDetails(
                              req._id
                            )
                          }
                        >
                          Update Status
                        </button>

                      </div>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>
        ) : (
          <div className="no-results">

            <div className="no-results-icon">
              📭
            </div>

            <h3>
              No Certificate Requests Found
            </h3>

            <p>
              {searchTerm
                ? "Try adjusting your search terms"
                : "There are no certificate requests to display"}
            </p>

          </div>
        )}

      </div>

      {/* FOOTER */}

      {filteredRequests.length > 0 && (
        <div className="table-footer">

          <div className="footer-stats">

            <div className="stat">

              <span className="stat-label">
                Total Requests:
              </span>

              <span className="stat-value">
                {filteredRequests.length}
              </span>

            </div>

            {filteredRequests.some(
              (r) =>
                r.status === "not_seen"
            ) && (
              <div className="stat">

                <span className="stat-label">
                  Pending Review:
                </span>

                <span className="stat-value warning-text">
                  {
                    filteredRequests.filter(
                      (r) =>
                        r.status ===
                        "not_seen"
                    ).length
                  }
                </span>

              </div>
            )}

            {filteredRequests.some(
              (r) =>
                r.status === "rejected"
            ) && (
              <div className="stat">

                <span className="stat-label">
                  Rejected:
                </span>

                <span className="stat-value error-text">
                  {
                    filteredRequests.filter(
                      (r) =>
                        r.status ===
                        "rejected"
                    ).length
                  }
                </span>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default CertificateRequests;