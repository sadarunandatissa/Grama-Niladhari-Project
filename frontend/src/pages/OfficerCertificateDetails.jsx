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
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetch = async () => {
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
        setMessage("Failed to load details.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const updateStatus = async () => {
    try {
      await axios.put(
        `${API_URL}/api/certificate/officer/update/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMessage("Status updated.");
      // refresh
      const res = await axios.get(`${API_URL}/api/certificate/officer/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCert(res.data.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!cert) return <div>Certificate not found</div>;

  const citizen = cert.citizenId;

  return (
    <div className="officer-cert-details">
      <h2>Certificate Request Details</h2>
      <button onClick={() => navigate(-1)}>Back</button>
      {message && <div className="alert">{message}</div>}

      <div className="citizen-card">
        <h3>Applicant Details</h3>
        {citizen.profile_picture && (
          <img src={`${API_URL}${citizen.profile_picture}`} alt="Profile" />
        )}
        <p>
          <strong>Name:</strong> {citizen.full_name}
        </p>
        <p>
          <strong>NIC:</strong> {citizen.nic}
        </p>
        <p>
          <strong>Email:</strong> {citizen.email}
        </p>
        <p>
          <strong>Phone:</strong> {citizen.phone_numbers?.join(", ")}
        </p>
        <p>
          <strong>Address:</strong> {citizen.address}
        </p>
      </div>

      <div className="cert-details">
        <h4>Certificate Type: {cert.certificateType}</h4>
        <p>
          <strong>Purpose:</strong> {cert.formData.reason}
        </p>
        {cert.formData.survey_number && (
          <p>
            <strong>Survey No:</strong> {cert.formData.survey_number}
          </p>
        )}
        {cert.formData.anual_income && (
          <p>
            <strong>Annual Income:</strong> LKR {cert.formData.anual_income}
          </p>
        )}
        <p>
          <strong>Status:</strong> {cert.status}
        </p>
        <p>
          <strong>Requested:</strong>{" "}
          {new Date(cert.requestedAt).toLocaleString()}
        </p>
      </div>

      {/* Attachments */}
      {cert.attachments && cert.attachments.length > 0 && (
        <div>
          <h4>Attachments</h4>
          {cert.attachments.map((file, i) => (
            <div key={i}>
              <a
                href={`${API_URL}${file}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Attachment {i + 1}
              </a>
            </div>
          ))}
        </div>
      )}

      <div className="status-update">
        <label>Update Status:</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="not_seen">Not Seen</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button onClick={updateStatus}>Update</button>
      </div>
    </div>
  );
};

export default OfficerCertificateDetails;
