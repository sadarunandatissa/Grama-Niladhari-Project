import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./RegistrationForm.css";

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    is_family_head: false,
    family_reg_no: "",
    nic: "",
    full_name: "",
    initials: "",
    surname: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    address: "",
    village_id: "",
    phone_numbers: [""],
    occupation: "",
    email: "",
    password: "",
    confirmPassword: "",
    profile_picture: null, // file object
  });

  // Fetch villages on mount
  useEffect(() => {
    const fetchVillages = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/admin/villages`,
        );
        setVillages(res.data.data);
      } catch (err) {
        console.error("Failed to fetch villages", err);
        setError("Could not load villages. Please refresh.");
      }
    };
    fetchVillages();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, profile_picture: files[0] }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
    setError("");
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

  const validateForm = () => {
    // Basic validations (full validation handled by backend)
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    if (!formData.profile_picture) {
      setError("Profile picture is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateForm()) return;

    setLoading(true);

    // Prepare FormData for multipart upload
    const data = new FormData();
    for (let key in formData) {
      if (key === "profile_picture") {
        if (formData.profile_picture) {
          data.append("profile_picture", formData.profile_picture);
        }
      } else if (key === "phone_numbers") {
        formData.phone_numbers.forEach((p, i) => {
          if (p.trim()) data.append(`phone_numbers[${i}]`, p.trim());
        });
      } else {
        data.append(key, formData[key]);
      }
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/registration/submit`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setSuccess(res.data.message);
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

  // ... rest of JSX (similar to earlier but with village dropdown and file input)
  // I'll provide a compact version below:
  return (
    <div className="registration-container">
      <div className="registration-card">
        <h2>Citizen Registration</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          {/* Role selection */}
          <div className="form-section">
            <h3>Family Information</h3>
            <label>
              <input
                type="radio"
                name="is_family_head"
                value={false}
                checked={!formData.is_family_head}
                onChange={handleChange}
              />
              Family Member
            </label>
            <label>
              <input
                type="radio"
                name="is_family_head"
                value={true}
                checked={formData.is_family_head}
                onChange={handleChange}
              />
              Family Head
            </label>
            {!formData.is_family_head && (
              <div className="form-group">
                <label>Family Registration Number *</label>
                <input
                  type="text"
                  name="family_reg_no"
                  value={formData.family_reg_no}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
          </div>

          {/* Personal details */}
          <div className="form-section">
            <h3>Personal Details</h3>
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
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Initials</label>
                <input
                  type="text"
                  name="initials"
                  value={formData.initials}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Surname</label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
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
                <label>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
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
                <label>Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="3"
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
            {/* Phone numbers */}
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
                    <button type="button" onClick={() => removePhone(i)}>
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addPhone}>
                + Add Phone
              </button>
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
            {/* Profile Picture */}
            <div className="form-group">
              <label>Profile Picture *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                name="profile_picture"
                required
              />
              <small>JPEG, PNG, GIF, WEBP (max 5MB)</small>
            </div>
          </div>

          {/* Password */}
          <div className="form-section">
            <h3>Login Credentials</h3>
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
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Submitting..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
