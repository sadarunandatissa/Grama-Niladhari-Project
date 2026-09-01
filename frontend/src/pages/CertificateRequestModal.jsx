import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../components/gn-officer/Sidebar";

const CertificateRequestModal = ({ onClose, onSuccess }) => {
  const { user, token } = useAuth();
  const [step, setStep] = useState(1);
  const [certificateType, setCertificateType] = useState("");
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Auto-fill fields from user context
  const citizenDetails = {
    nic: user?.nic || "",
    first_name: user?.first_name || "",
    middle_name: user?.middle_name || "",
    last_name: user?.last_name || "",
    surname: user?.surname || "",
    address: user?.address || "",
    telephone: user?.phone_numbers?.[0] || "",
  };

  const handleTypeSelect = (type) => {
    setCertificateType(type);
    // Initialize form data with auto-fill fields
    setFormData({
      nic: citizenDetails.nic,
      first_name: citizenDetails.first_name,
      middle_name: citizenDetails.middle_name,
      last_name: citizenDetails.last_name,
      surname: citizenDetails.surname,
      address: citizenDetails.address,
      telephone: citizenDetails.telephone,
      // Additional fields
      reason: "",
      survey_number: "",
      anual_income: "",
      copy_of_bill: null,
      plan_or_receipt: null,
    });
    setStep(2);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate required fields per type
    let missing = [];
    if (certificateType === "residential") {
      if (!formData.reason) missing.push("reason");
      if (!formData.survey_number) missing.push("survey_number");
    } else if (certificateType === "income") {
      if (!formData.anual_income) missing.push("anual_income");
      if (!formData.reason) missing.push("reason");
    } else if (certificateType === "character") {
      if (!formData.reason) missing.push("reason");
    }
    if (missing.length > 0) {
      setError(`Please fill: ${missing.join(", ")}`);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        certificateType,
        formData: { ...formData },
      };
      // Remove file fields from payload (they will be handled separately)
      delete payload.formData.copy_of_bill;
      delete payload.formData.plan_or_receipt;

      const response = await axios.post(
        `${API_URL}/api/certificate/request`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSuccess("Certificate requested successfully!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h3>Request a Certificate</h3>

        {step === 1 && (
          <div className="cert-type-select">
            <p>Select the type of certificate you need:</p>
            <div className="type-cards">
              <div
                className="type-card"
                onClick={() => handleTypeSelect("residential")}
              >
                <span>🏠</span>
                <h4>Residential Confirmation</h4>
                <p>Grama Niladhari Certificate</p>
              </div>
              <div
                className="type-card"
                onClick={() => handleTypeSelect("income")}
              >
                <span>💰</span>
                <h4>Income Certificate</h4>
                <p>Recommendation Letter</p>
              </div>
              <div
                className="type-card"
                onClick={() => handleTypeSelect("character")}
              >
                <span>⭐</span>
                <h4>Character Certificate</h4>
                <p>Recommendation Letter</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <h4>Fill the details</h4>
            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            {/* Auto-filled fields (readonly) */}
            <div className="form-row">
              <div className="form-group">
                <label>NIC</label>
                <input type="text" value={formData.nic} disabled />
              </div>
              <div className="form-group">
                <label>First Name</label>
                <input type="text" value={formData.first_name} disabled />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Middle Name</label>
                <input type="text" value={formData.middle_name} disabled />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" value={formData.last_name} disabled />
              </div>
            </div>
            <div className="form-group">
              <label>Surname</label>
              <input type="text" value={formData.surname} disabled />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea value={formData.address} disabled rows="2" />
            </div>
            <div className="form-group">
              <label>Telephone</label>
              <input type="text" value={formData.telephone} disabled />
            </div>

            {/* Dynamic fields based on type */}
            {certificateType === "residential" && (
              <>
                <div className="form-group">
                  <label>Reason for Request *</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    rows="3"
                    placeholder="Explain why you need this certificate"
                  />
                </div>
                <div className="form-group">
                  <label>Survey Number *</label>
                  <input
                    type="text"
                    name="survey_number"
                    value={formData.survey_number}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 123/45"
                  />
                </div>
                <div className="form-group">
                  <label>Copy of Electricity/Water Bill</label>
                  <input
                    type="file"
                    name="copy_of_bill"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleChange}
                  />
                  <small>Optional: Upload a scanned copy of the bill</small>
                </div>
              </>
            )}

            {certificateType === "income" && (
              <>
                <div className="form-group">
                  <label>Annual Income (LKR) *</label>
                  <input
                    type="number"
                    name="anual_income"
                    value={formData.anual_income}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="e.g., 500000"
                  />
                </div>
                <div className="form-group">
                  <label>Reason for Request *</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    rows="3"
                    placeholder="Explain why you need this income certificate"
                  />
                </div>
                <div className="form-group">
                  <label>Plan of Land or Pay Sheet Receipt</label>
                  <input
                    type="file"
                    name="plan_or_receipt"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleChange}
                  />
                  <small>Optional: Upload supporting document</small>
                </div>
              </>
            )}

            {certificateType === "character" && (
              <>
                <div className="form-group">
                  <label>Reason for Request *</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    rows="3"
                    placeholder="Explain why you need a character certificate (e.g., job application, scholarship)"
                  />
                </div>
              </>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CertificateRequestModal;
