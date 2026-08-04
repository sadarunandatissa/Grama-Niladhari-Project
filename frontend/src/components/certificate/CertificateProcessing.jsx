import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const CertificateProcessing = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [officerNotes, setOfficerNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/certificate/officer/pending`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setRequests(res.data.data);
    } catch (err) {
      console.error("Failed to fetch requests: ", err);
    } finally {
      setLoading(false);
    }
  };
};
