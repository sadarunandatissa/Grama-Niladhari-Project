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
  }, [API_URL]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, profile_picture: files[0] }));
    } else if (type === "checkbox") {
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
      setStep((prev) => prev + 1);
      setError("");
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
    setError("");
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fullName = [
      formData.first_name.trim(),
      formData.middle_name.trim(),
      formData.last_name.trim(),
    ]
      .filter(Boolean)
      .join(" ");

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
        // handled via fullName
      } else {
        data.append(key, formData[key]);
      }
    }

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

  // Left sidebar pane dynamic details
  const getPaneDetails = () => {
    switch (step) {
      case 1:
        return {
          title: "Step 1: Household Verification",
          desc: "We need to identify your role within your household to provide personalized government services and assistance programs.",
        };
      case 2:
        return {
          title: "Step 2: Personal Details",
          desc: "Please provide accurate personal details as they appear on your legal documents and identification cards.",
        };
      case 3:
        return {
          title: "Step 3: Account Security",
          desc: "Create a secure password to protect your account access and manage your citizen identity profile safely.",
        };
      default:
        return {};
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        {/* Header Progress */}
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

        {/* Form Body Split */}
        <div className="registration-body">
          {/* Left Info Pane */}
          <div className="info-pane">
            <div className="illustration-wrapper">
              <img
                src="./src/assets/20945597.jpg"
                alt={`Step ${step} Illustration`}
                className="step-illustration"
              />
            </div>
            <div className="info-content">
              <h3>{getPaneDetails().title}</h3>
              <p>{getPaneDetails().desc}</p>
            </div>
          </div>

          {/* Right Form Pane */}
          <div className="form-pane">
            <div>
              {error && <div className="alert error">{error}</div>}
              {success && <div className="alert success">{success}</div>}
            </div>

            <form onSubmit={handleSubmit} className="step-form">
              {/* STEP 1 */}
              {step === 1 && (
                <div className="form-section fade-in">
                  <h2>Household Verification</h2>
                  <p className="section-description">
                    Please confirm your status in the family household registry.
                  </p>

                  <h4 className="field-question">
                    Are you the Head of the Family?
                  </h4>

                  <div className="radio-group-cards">
                    <label
                      className={`radio-card ${
                        formData.is_family_head === true ? "selected" : ""
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          is_family_head: true,
                        }))
                      }
                    >
                      <input
                        type="radio"
                        name="is_family_head"
                        checked={formData.is_family_head === true}
                        onChange={() => {}}
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
                      className={`radio-card ${
                        formData.is_family_head === false ? "selected" : ""
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          is_family_head: false,
                        }))
                      }
                    >
                      <input
                        type="radio"
                        name="is_family_head"
                        checked={formData.is_family_head === false}
                        onChange={() => {}}
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

              {/* STEP 2 */}
              {step === 2 && (
                <div className="form-section fade-in">
                  <h2>Personal Details</h2>
                  <p className="section-description">
                    Please provide your personal details as they appear on your
                    legal documents.
                  </p>

                  {!formData.is_family_head && (
                    <div className="alert info">
                      You are registering as a family member.
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@mail.com"
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
                        placeholder="e.g. 199012345678"
                        required
                      />
                    </div>
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
                        placeholder="Optional"
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
                        placeholder="e.g. A.B.C."
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
                        placeholder="Optional"
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
                      placeholder="Enter your full residential address"
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
                    <label>Phone Number *</label>
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
                      Back
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

              {/* STEP 3 */}
              {step === 3 && (
                <div className="form-section fade-in">
                  <h2>Create Password</h2>
                  <p className="section-description">
                    Set up your secure password to complete registration.
                  </p>

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
                      Back
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
