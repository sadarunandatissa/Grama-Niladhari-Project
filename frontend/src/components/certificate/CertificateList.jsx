import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const CertificateList = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState([true]);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/certificate/citizen/my-requests`,
          { header: { Authorization: `Bearer ${token}` } },
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

  if (loading) return <div>Loading your Certificate requests..</div>;
  if (error) return <div className="alert error">{error}</div>;
};
