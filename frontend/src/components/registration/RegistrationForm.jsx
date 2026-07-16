// src/components/registration/RegistrationForm.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./RegistrationForm.css";

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    is_family_head: false,
    family_reg_no: "",
    email: "",
    nic: "",
    surname: "",
    initials: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    // full_name removed
    date_of_birth: "",
    address: "",
    village_id: "",
    phone_numbers: [""],
    occupation: "",
    password: "",
    confirmPassword: "",
    profile_picture: null,
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchVillages = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/villages`);
        setVillages(res.data.data);
      } catch (err) {
        console.error("Failed to load villages", err);
        setError("Could not load villages. Please refresh.");
      }
    };
    fetchVillages();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, profile_picture: files[0] }));
    } else if (type === "radio" || type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePhoneChange = (index, value) => {
    const newPhones = [...formData.phone_numbers];
    newPhones[index] = value;
    setFormData((prev) => ({ ...prev, phone_numbers: newPhones }));
  };

  const addPhone = () => {
    setFormData((prev) => ({
      ...prev,
      phone_numbers: [...prev.phone_numbers, ""],
    }));
  };

  const removePhone = (index) => {
    if (formData.phone_numbers.length > 1) {
      setFormData((prev) => ({
        ...prev,
        phone_numbers: prev.phone_numbers.filter((_, i) => i !== index),
      }));
    }
  };

  // ── Validation ────────────────────────────────────────────────
  const validateStep = () => {
    if (step === 1) return true;
    if (step === 2) {
      // ✅ Full name removed – only check first name
      if (!formData.first_name.trim()) {
        setError("First name is required.");
        return false;
      }
      if (
        !formData.email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        setError("Valid email required.");
        return false;
      }
      const nic = formData.nic.trim().toUpperCase();
      if (!/^[0-9]{9}V$/.test(nic) && !/^[0-9]{12}$/.test(nic)) {
        setError("Invalid NIC format.");
        return false;
      }
      if (!formData.date_of_birth) {
        setError("Date of birth required.");
        return false;
      }
      if (!formData.address.trim()) {
        setError("Address required.");
        return false;
      }
      if (!formData.village_id) {
        setError("Village selection required.");
        return false;
      }
      for (const p of formData.phone_numbers) {
        if (p.trim() && !/^[0-9]{10}$/.test(p.trim())) {
          setError("Phone numbers must be 10 digits.");
          return false;
        }
      }
      if (!formData.profile_picture) {
        setError("Profile picture required.");
        return false;
      }
      if (!formData.is_family_head && !formData.family_reg_no.trim()) {
        setError("Family registration number is required for family members.");
        return false;
      }
      setError("");
      return true;
    }
    if (step === 3) {
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters.");
        return false;
      }
      if (
        !/[a-zA-Z]/.test(formData.password) ||
        !/[0-9]/.test(formData.password)
      ) {
        setError("Password must contain at least one letter and one number.");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return false;
      }
      setError("");
      return true;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
      setError("");
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setError("");
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Construct full_name from first + middle + last
    const fullName = [
      formData.first_name.trim(),
      formData.middle_name.trim(),
      formData.last_name.trim(),
    ]
      .filter(Boolean)
      .join(" ");

    // Final validation: require at least first name
    if (!fullName) {
      setError("First name is required.");
      return;
    }

    if (!formData.is_family_head && !formData.family_reg_no.trim()) {
      setError("Family registration number is required for family members.");
      return;
    }

    if (!validateStep()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    const data = new FormData();
    // Append all fields except confirmPassword
    for (let key in formData) {
      if (key === "profile_picture") {
        if (formData.profile_picture)
          data.append("profile_picture", formData.profile_picture);
      } else if (key === "phone_numbers") {
        formData.phone_numbers.forEach((p, i) => {
          if (p.trim()) data.append(`phone_numbers[${i}]`, p.trim());
        });
      } else if (key === "confirmPassword") {
        // skip
      } else if (
        key === "first_name" ||
        key === "middle_name" ||
        key === "last_name"
      ) {
        // already handled via fullName construction
      } else {
        data.append(key, formData[key]);
      }
    }

    // ✅ Append the constructed full_name
    data.append("full_name", fullName);

    try {
      const response = await axios.post(
        `${API_URL}/api/registration/submit`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setSuccess(response.data.message);
      setTimeout(() => navigate("/registration-success"), 2000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.join(", ") ||
        "Registration failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="registration-container">
      <div className="registration-card">
        {/* Top Header & Progress Bar */}
        <div className="registration-header">
          <div className="header-meta">
            <span className="step-text">
              Step {step} of 3: Citizen Registration
            </span>
            <span className="percent-text">
              {Math.round((step / 3) * 100)}% Complete
            </span>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Split Body Layout */}
        <div className="registration-body">
          {/* Left Information Pane */}
          <div className="info-pane">
            <div className="illustration-wrapper">
              {/* Replace this placeholder source with your local asset or SVG */}
              <img
                src="./src/assets/20943565.jpg"
                alt="Step 1: Household Verification"
                className="step-illustration"
              />
            </div>
            <div className="info-content">
              <h3>Step {step}: Household Verification</h3>
              <p>
                We need to identify your role within your household to provide
                personalized government services and assistance programs.
              </p>
            </div>
          </div>

          {/* Right Form Pane */}
          <div className="form-pane">
            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            <form onSubmit={handleSubmit} className="step-form">
              {/* Step 1: Family Info */}
              {step === 1 && (
                <div className="form-section">
                  <h2>
                    Household Verification
                    <br />
                  </h2>

                  <p className="section-description">
                    Please confirm your status in the family household registry.
                  </p>

                  <h4 className="field-question">
                    Are you the Head of the Family?
                  </h4>

                  <div className="radio-group-cards">
                    <label
                      className={`radio-card ${formData.is_family_head === true ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="is_family_head"
                        value="true"
                        checked={formData.is_family_head === true}
                        onChange={() =>
                          handleChange({
                            target: { name: "is_family_head", value: true },
                          })
                        }
                      />
                      <span className="custom-radio"></span>
                      <div className="radio-text">
                        <span className="radio-title">
                          Yes, I am the Family Head
                        </span>
                        <span className="radio-desc">
                          Select this if you are registered as the primary
                          contact for this household.
                        </span>
                      </div>
                    </label>

                    <label
                      className={`radio-card ${formData.is_family_head === false ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="is_family_head"
                        value="false"
                        checked={formData.is_family_head === false}
                        onChange={() =>
                          handleChange({
                            target: { name: "is_family_head", value: false },
                          })
                        }
                      />
                      <span className="custom-radio"></span>
                      <div className="radio-text">
                        <span className="radio-title">
                          No, I am a Family Member
                        </span>
                        <span className="radio-desc">
                          Select this if you are a dependent or a relative
                          living in the household.
                        </span>
                      </div>
                    </label>
                  </div>

                  {formData.is_family_head === false && (
                    <div className="form-group fade-in">
                      <label>Family Registration Number *</label>
                      <input
                        type="text"
                        name="family_reg_no"
                        value={formData.family_reg_no}
                        onChange={handleChange}
                        placeholder="e.g., 56776-FAM-001"
                        required
                      />
                      <small className="form-help">
                        Ask your family head for this number
                      </small>
                    </div>
                  )}

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-next"
                      onClick={nextStep}
                    >
                      Next Step <span className="arrow-icon">→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Personal Details */}
              {step === 2 && (
                <div className="form-section">
                  <h2>Personal Details</h2>

                  {!formData.is_family_head && (
                    <div className="alert info">
                      You are registering as a family member. Your family
                      registration number must be entered above.
                    </div>
                  )}

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>NIC *</label>
                    <input
                      type="text"
                      name="nic"
                      value={formData.nic}
                      onChange={handleChange}
                      placeholder="9 digits + V or 12 digits"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Middle Name</label>
                      <input
                        type="text"
                        name="middle_name"
                        value={formData.middle_name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Surname</label>
                      <input
                        type="text"
                        name="surname"
                        value={formData.surname}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Initials</label>
                      <input
                        type="text"
                        name="initials"
                        value={formData.initials}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Date of Birth *</label>
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Occupation</label>
                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Address *</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Village *</label>
                    <select
                      name="village_id"
                      value={formData.village_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select your village</option>
                      {villages.map((v) => (
                        <option key={v.village_id} value={v.village_id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Phone Numbers *</label>
                    {formData.phone_numbers.map((p, i) => (
                      <div key={i} className="phone-input-group">
                        <input
                          type="tel"
                          value={p}
                          onChange={(e) => handlePhoneChange(i, e.target.value)}
                          placeholder="0712345678"
                          required
                        />
                        {i > 0 && (
                          <button
                            type="button"
                            className="btn-remove-phone"
                            onClick={() => removePhone(i)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn-add-phone"
                      onClick={addPhone}
                    >
                      + Add another phone
                    </button>
                  </div>

                  <div className="form-group">
                    <label>Profile Picture *</label>
                    <input
                      type="file"
                      name="profile_picture"
                      accept="image/*"
                      onChange={handleChange}
                      required
                    />
                    <small className="form-help">
                      JPEG, PNG, GIF, WEBP (max 5MB)
                    </small>
                  </div>

                  <div className="form-actions split">
                    <button
                      type="button"
                      className="btn-prev"
                      onClick={prevStep}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="btn-next"
                      onClick={nextStep}
                    >
                      Next Step <span className="arrow-icon">→</span>
                    </button>
                  </div>
                </div>
              )}
              {/* Step 3: Password */}
              {step === 3 && (
                <div className="form-section">
                  <h2>Create Password</h2>
                  <div className="form-group">
                    <label>Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="8"
                    />
                    <small className="form-help">
                      At least 8 characters with a letter and a number
                    </small>
                  </div>
                  <div className="form-group">
                    <label>Confirm Password *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-actions split">
                    <button
                      type="button"
                      className="btn-prev"
                      onClick={prevStep}
                    >
                      Previous
                    </button>
                    <button
                      type="submit"
                      className="btn-submit"
                      disabled={loading}
                    >
                      {loading ? "Submitting..." : "Submit Registration"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
