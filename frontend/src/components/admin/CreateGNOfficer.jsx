import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const CreateGNOfficer = () => {
  const { token } = useAuth();
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    village_id: "",
    profile_picture: null,
  });

  useEffect(() => {
    const fetchVillages = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/admin/villages`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setVillages(res.data.data);
      } catch (err) {
        setError("Failed to load villages.");
      }
    };
    fetchVillages();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_picture") {
      setFormData((prev) => ({ ...prev, profile_picture: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const data = new FormData();
    for (let key in formData) {
      if (key === "profile_picture" && formData.profile_picture) {
        data.append("profile_picture", formData.profile_picture);
      } else {
        data.append(key, formData[key]);
      }
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/gn-officer`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      setSuccess("GN Officer created successfully!");
      setFormData({
        email: "",
        password: "",
        full_name: "",
        phone: "",
        village_id: "",
        profile_picture: null,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Creation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-officer-container">
      <h2>Create GN Officer</h2>
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}
      <form onSubmit={handleSubmit}>
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
          <label>Full Name *</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
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
            <option value="">Select a village</option>
            {villages.map((v) => (
              <option key={v.village_id} value={v.village_id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Profile Picture (optional)</label>
          <input
            type="file"
            accept="image/*"
            name="profile_picture"
            onChange={handleChange}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create GN Officer"}
        </button>
      </form>
    </div>
  );
};

export default CreateGNOfficer;
