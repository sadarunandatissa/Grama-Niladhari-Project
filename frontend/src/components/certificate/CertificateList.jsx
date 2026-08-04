import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const CertificateList = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/certificate/citizen/my-requests`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setRequests(res.data.data);
      } catch (err) {
        setError("Failed to load your requests.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const statusColors = {
    pending: "#f39c12",
    processing: "#3498db",
    completed: "#27ae60",
    rejected: "#e74c3c",
  };

  if (loading) return <div>Loading your certificate requests...</div>;
  if (error) return <div className="alert error">{error}</div>;

  return (
    <div className="certificate-list">
      <h4>My Certificate Requests</h4>
      {requests.length === 0 ? (
        <p>You haven't requested any certificates yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Type</th>
              <th>Status</th>
              <th>Request Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req._id}>
                <td>
                  <strong>{req.trackingId}</strong>
                </td>
                <td>{req.certificateType.replace("_", " ").toUpperCase()}</td>
                <td>
                  <span
                    style={{
                      background: statusColors[req.status],
                      color: "white",
                      padding: "2px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {req.status}
                  </span>
                </td>
                <td>{new Date(req.requestDate).toLocaleDateString()}</td>
                <td>
                  <button className="btn-view">View</button>
                  {req.certificateFile && (
                    <a
                      href={`${API_URL}${req.certificateFile}`}
                      target="_blank"
                      className="btn-download"
                    >
                      Download
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CertificateList;
