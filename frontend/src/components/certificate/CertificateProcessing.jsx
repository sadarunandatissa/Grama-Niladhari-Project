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
};
