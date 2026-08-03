import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { certificateFields, certificateTypeLabels } from "./CertificateFields";

const CertificateRequestForm = ({ onSuccess }) => {
  const { token } = useAuth();
  const [selectedType, setSelectedType] = usestate("");
  const [formData, setFormData] = useState({});
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleFileChange = (e) => {
    setDocuments([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!selectedType) {
      setError("Please enter the purpose (at least 5 characters). ");
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append("certificateType", selectedType);
    data.append("purpose", purpose.trim());
    for (let key in formData) {
      if (formData[key] && typeof formData[key] === "string") {
        data.append(`formData[${key}]`, formData[key]);
      }
    }
    documents.forEach((file) => {
      data.append("documents", file);
    });
    try {
      const response = await axios.post(
        `${API}/api/certificate/citizen/request`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      setSuccess(
        ` ${response.data.message}. Tracking ID: ${response.data.data.trackingID}`,
      );
      if (onSuccess) onSuccess();
      //Rest form
      setSelectedType("");
      setPurpose("");
      setFormData({});
      setDocuments([]);
    } catch (error) {
      setError(error.response?.data?.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  };
};
