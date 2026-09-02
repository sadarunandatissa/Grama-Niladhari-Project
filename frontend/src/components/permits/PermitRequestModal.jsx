import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./PermitRequestModal.css";

const PermitRequestModal = ({ onClose, onSuccess }) => {
  const { user, token } = useAuth();
  const [step, setStep] = useState(1);
  const [permitType, setPermitType] = useState("");
  const [formData, setFormData] = useState({
    survey_number: "",
    trees: [{ treeType: "", height: "", circumference: "", grossStandAge: "" }],
    reason: "",
    quantity: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleTypeSelect = (type) => {
    setPermitType(type);
    setStep(2);
    if (type === "timber") {
      setFormData({
        survey_number: "",
        trees: [
          { treeType: "", height: "", circumference: "", grossStandAge: "" },
        ],
      });
    } else {
      setFormData({ reason: "", quantity: "" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTreeChange = (index, field, value) => {
    const updated = [...formData.trees];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, trees: updated }));
  };

  const addTree = () => {
    if (formData.trees.length < 3) {
      setFormData((prev) => ({
        ...prev,
        trees: [
          ...prev.trees,
          { treeType: "", height: "", circumference: "", grossStandAge: "" },
        ],
      }));
    }
  };

  const removeTree = (index) => {
    if (formData.trees.length > 1) {
      setFormData((prev) => ({
        ...prev,
        trees: prev.trees.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let payload = { permitType, formData: { ...formData } };
      // Auto-fill fields from user (already handled on backend, but we can skip)
      const res = await axios.post(`${API_URL}/api/permits/citizen`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Permit request submitted!");
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
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
        <h3>Request Permit</h3>

        {step === 1 && (
          <div className="permit-type-select">
            <p>Select permit type:</p>
            <div className="type-cards">
              <div
                className="type-card"
                onClick={() => handleTypeSelect("timber")}
              >
                <span>🌳</span>
                <h4>Timber Felling & Transport</h4>
                <p>Recommendation for timber cutting</p>
              </div>
              <div
                className="type-card"
                onClick={() => handleTypeSelect("sand")}
              >
                <span>🏖️</span>
                <h4>Sand Mining & Transport</h4>
                <p>Recommendation for sand extraction</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            {permitType === "timber" && (
              <>
                <div className="form-group">
                  <label>Survey Number of Land *</label>
                  <input
                    type="text"
                    name="survey_number"
                    value={formData.survey_number}
                    onChange={handleChange}
                    required
                  />
                  <small>Must match a land registered under your NIC</small>
                </div>
                <div className="form-group">
                  <label>Trees (1 to 3) *</label>
                  {formData.trees.map((tree, idx) => (
                    <div key={idx} className="tree-group">
                      <select
                        value={tree.treeType}
                        onChange={(e) =>
                          handleTreeChange(idx, "treeType", e.target.value)
                        }
                        required
                      >
                        <option value="">Select tree type</option>
                        <option value="Jackfruit tree">Jackfruit tree</option>
                        <option value="Breadfruit tree">Breadfruit tree</option>
                        <option value="Palms">Palms</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Height (m)"
                        value={tree.height}
                        onChange={(e) =>
                          handleTreeChange(idx, "height", e.target.value)
                        }
                        required
                      />
                      <input
                        type="number"
                        placeholder="Circumference (inch)"
                        value={tree.circumference}
                        onChange={(e) =>
                          handleTreeChange(idx, "circumference", e.target.value)
                        }
                        required
                      />
                      <input
                        type="number"
                        placeholder="Gross Stand Age (years)"
                        value={tree.grossStandAge}
                        onChange={(e) =>
                          handleTreeChange(idx, "grossStandAge", e.target.value)
                        }
                        required
                      />
                      {formData.trees.length > 1 && (
                        <button type="button" onClick={() => removeTree(idx)}>
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {formData.trees.length < 3 && (
                    <button type="button" className="btn-add" onClick={addTree}>
                      + Add Tree
                    </button>
                  )}
                </div>
              </>
            )}

            {permitType === "sand" && (
              <>
                <div className="form-group">
                  <label>Reason *</label>
                  <select
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select reason</option>
                    <option value="Residential Construction">
                      Residential Construction
                    </option>
                    <option value="Concrete Block Manufacturing">
                      Concrete Block Manufacturing
                    </option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity (cubic meters) *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    max="5"
                    required
                  />
                  <small>Maximum 5 cubic meters</small>
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

export default PermitRequestModal;
