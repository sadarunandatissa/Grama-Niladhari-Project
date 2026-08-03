import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { certificateFields, certificateTypeLabels } from "./CertificateFields";

const CertificateRequestForm = ({ onSuccess }) => {
  const { token } = useAuth();
  const [selectedType, setSelectedType] = usestate("");
  const [formData, setFoemData] = useState({});
  const [purpose, setPurpose] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loadinf, setLoading] = usestate(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setSelectedType(type);
    //Rest form data when type changes
    const initialData = {};
    (certificateFields[type] || []).forEach((field) => {
      initialData[field.name] = "";
    });
    setFormData(initialData);
    setError("");
    setSuccess("");
  };
  const handleFileChange = (e) => {
    setDocuments([...e.target.files]);
  };
};
