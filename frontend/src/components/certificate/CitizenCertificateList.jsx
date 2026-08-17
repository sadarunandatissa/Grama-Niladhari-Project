import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

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

  const statusLabels = {
    not_seen: "Not Seen",
    in_progress: "In Progress",
    completed: "Completed",
  };
  const statusColors = {
    not_seen: "#f39c12",
    in_progress: "#3498db",
    completed: "#27ae60",
  };

  if (loading) return <div>Loading your certificate requests...</div>;
  if (error) return <div className="alert error">{error}</div>;

  return (
    <div className="certificate-requests">
      <h4>My Certificate Requests</h4>
      {certificates.length === 0 ? (
        <p>You haven't requested any certificates yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Status</th>
              <th>Requested On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Inside the table body */}
            {certificates.map((cert) => (
              <tr key={cert._id}>
                <td>{cert.certificateType.replace("_", " ").toUpperCase()}</td>
                <td>
                  <span
                    style={{
                      background: statusColors[cert.status],
                      color: "white",
                      padding: "2px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {statusLabels[cert.status]}
                  </span>
                  {cert.status === "rejected" && cert.rejectionReason && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#e74c3c",
                        marginTop: "4px",
                      }}
                    >
                      Reason: {cert.rejectionReason}
                    </div>
                  )}
                </td>
                <td>{new Date(cert.requestedAt).toLocaleDateString()}</td>
                <td>
                  <Link
                    to={`/citizen/certificate/${cert._id}`}
                    className="btn-view"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CitizenCertificateList;
