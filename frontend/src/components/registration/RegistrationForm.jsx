import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./RegistrationForm.css";

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    // Family Status
    is_family_head: false,
    family_reg_no: "",

    // Personal Details
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
    village: "",
    phone_numbers: [""],
    email: "",
    occupation: "",

    // Login Credentials
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handlePhoneChange = (index, value) => {
    const newPhones = [...formData.phone_numbers];
    newPhones[index] = value;
    setFormData((prev) => ({
      ...prev,
      phone_numbers: newPhones,
    }));
  };

  const addPhoneField = () => {
    setFormData((prev) => ({
      ...prev,
      phone_numbers: [...prev.phone_numbers, ""],
    }));
  };

  const removePhoneField = (index) => {
    if (formData.phone_numbers.length > 1) {
      const newPhones = formData.phone_numbers.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        phone_numbers: newPhones,
      }));
    }
  };

  const validateForm = () => {
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    // Phone validation
    for (let phone of formData.phone_numbers) {
      if (phone && !/^[0-9]{10}$/.test(phone)) {
        setError("Phone numbers must be exactly 10 digits");
        return false;
      }
    }

    // NIC validation
    const nic = formData.nic.toUpperCase();
    const oldNIC = /^[0-9]{9}V$/;
    const newNIC = /^[0-9]{12}$/;
    if (!oldNIC.test(nic) && !newNIC.test(nic)) {
      setError("Invalid NIC format. Use 9 digits + V or 12 digits.");
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

    try {
      // Format phone numbers - remove empty ones
      const phoneNumbers = formData.phone_numbers.filter(
        (p) => p.trim() !== "",
      );

      if (phoneNumbers.length === 0) {
        setError("At least one phone number is required");
        setLoading(false);
        return;
      }

      const submitData = {
        ...formData,
        phone_numbers: phoneNumbers,
        nic: formData.nic.toUpperCase().trim(),
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/registration/submit`,
        submitData,
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        setTimeout(() => {
          navigate("/registration-success", {
            state: { message: response.data.message },
          });
        }, 2000);
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.join(", "));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        <h2>Citizen Registration</h2>
        <p className="subtitle">Register to access GN services online</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="form-section">
            <h3>Family Information</h3>
            <div className="role-selector">
              <label className="radio-option">
                <input
                  type="radio"
                  name="is_family_head"
                  value={false}
                  checked={formData.is_family_head === false}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      is_family_head: false,
                      family_reg_no: "",
                    }))
                  }
                />
                <span>I am a Family Member (I have Family Reg No)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="is_family_head"
                  value={true}
                  checked={formData.is_family_head === true}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      is_family_head: true,
                      family_reg_no: "",
                    }))
                  }
                />
                <span>I am the Family Head (I'll create a new family)</span>
              </label>
            </div>

            {!formData.is_family_head && (
              <div className="form-group">
                <label>Family Registration Number *</label>
                <input
                  type="text"
                  name="family_reg_no"
                  value={formData.family_reg_no}
                  onChange={handleChange}
                  placeholder="e.g., GN-123-FAM-001"
                  required
                />
                <small>Get this from your family head</small>
              </div>
            )}
          </div>

          {/* Personal Details */}
          <div className="form-section">
            <h3>Personal Details</h3>

            <div className="form-row">
              <div className="form-group">
                <label>NIC Number *</label>
                <input
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  placeholder="e.g., 123456789V or 200012345678"
                  required
                />
                <small>OLD: 9 digits + V | NEW: 12 digits</small>
              </div>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Full name as per NIC"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Initials</label>
                <input
                  type="text"
                  name="initials"
                  value={formData.initials}
                  onChange={handleChange}
                  placeholder="e.g., K.G.M."
                />
              </div>
              <div className="form-group">
                <label>Surname</label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  placeholder="e.g., Perera"
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
                  placeholder="e.g., Saman"
                />
              </div>
              <div className="form-group">
                <label>Middle Name</label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                  placeholder="e.g., Kumara"
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="e.g., Bandara"
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
              <div className="form-group">
                <label>Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="e.g., Farmer, Teacher"
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
                placeholder="Enter your complete address"
                required
              />
            </div>

            <div className="form-group">
              <label>Village *</label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                placeholder="Enter your village name"
                required
              />
            </div>

            {/* Phone Numbers */}
            <div className="form-group">
              <label>Phone Numbers *</label>
              {formData.phone_numbers.map((phone, index) => (
                <div key={index} className="phone-input-group">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(index, e.target.value)}
                    placeholder="e.g., 0712345678"
                    required
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removePhoneField(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn-add" onClick={addPhoneField}>
                + Add Another Phone
              </button>
              <small>Each phone must be exactly 10 digits</small>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
              />
            </div>
          </div>

          {/* Login Credentials */}
          <div className="form-section">
            <h3>Login Credentials</h3>

            <div className="form-group">
              <label>Username *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a unique username (min 3 chars)"
                required
                minLength="3"
              />
              <small>Letters, numbers, and underscores only</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 chars with letter and number"
                  required
                  minLength="8"
                />
                <small>At least 8 characters with 1 letter and 1 number</small>
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Submitting..." : "Register"}
            </button>
          </div>

          <div className="info-text">
            <p>
              After submission, your registration will be sent to your village
              GN Officer for verification. You will receive a notification once
              verified.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
