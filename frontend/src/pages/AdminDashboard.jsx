// src/pages/AdminDashboard.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
// import "../components/admin/AdminDashboard.css"; // Create this file or remove the import

// Helper to get API URL (Vite compatible)
const getApiUrl = () => {
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return "http://localhost:5000";
};

const AdminDashboard = () => {
  const { user, token, logout } = useAuth();
  const API_URL = getApiUrl();

  // State
  const [stats, setStats] = useState(null);
  const [villages, setVillages] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    village_id: "",
    profile_picture: null,
    village_id_village: "",
    name: "",
    ds_division: "",
    district: "",
    province: "",
  });

  // Fetch all data
  const fetchData = async () => {
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) {
      setError("No authentication token. Please login again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const headers = { Authorization: `Bearer ${activeToken}` };
      const [statsRes, villagesRes, officersRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/stats`, { headers }),
        axios.get(`${API_URL}/api/admin/villages`, { headers }),
        axios.get(`${API_URL}/api/admin/gn-officers`, { headers }),
      ]);

      setStats(statsRes.data.data);
      setVillages(villagesRes.data.data);
      setOfficers(officersRes.data.data);
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response?.status === 401) {
        logout();
        setError("Session expired. Please login again.");
      } else {
        setError(
          err.response?.data?.message || "Failed to load dashboard data.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Form handlers
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_picture") {
      setFormData((prev) => ({ ...prev, profile_picture: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      full_name: "",
      phone: "",
      village_id: "",
      profile_picture: null,
      village_id_village: "",
      name: "",
      ds_division: "",
      district: "",
      province: "",
    });
    setShowModal(false);
    setModalType("");
  };

  // Create GN Officer
  const handleSubmitOfficer = async (e) => {
    e.preventDefault();
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) {
      alert("Please login again.");
      return;
    }

    const data = new FormData();
    for (let key in formData) {
      if (key === "profile_picture" && formData.profile_picture) {
        data.append("profile_picture", formData.profile_picture);
      } else if (
        key !== "profile_picture" &&
        key !== "village_id_village" &&
        key !== "name" &&
        key !== "ds_division" &&
        key !== "district" &&
        key !== "province"
      ) {
        data.append(key, formData[key]);
      }
    }
    data.append("village_id", formData.village_id);

    try {
      await axios.post(`${API_URL}/api/admin/gn-officer`, data, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("GN Officer created successfully!");
      resetForm();
      fetchData();
    } catch (err) {
      console.error("Create officer error:", err);
      alert(err.response?.data?.message || "Creation failed.");
    }
  };

  // Create Village
  const handleSubmitVillage = async (e) => {
    e.preventDefault();
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) {
      alert("Please login again.");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/admin/villages`,
        {
          village_id: formData.village_id_village,
          name: formData.name,
          ds_division: formData.ds_division,
          district: formData.district,
          province: formData.province,
        },
        { headers: { Authorization: `Bearer ${activeToken}` } },
      );
      alert("Village created successfully!");
      resetForm();
      fetchData();
    } catch (err) {
      console.error("Create village error:", err);
      alert(err.response?.data?.message || "Creation failed.");
    }
  };

  // Delete GN Officer
  const handleDeleteOfficer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this GN Officer?"))
      return;
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) {
      alert("Please login again.");
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/admin/gn-officer/${id}`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      alert("GN Officer deleted.");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Deletion failed.");
    }
  };

  // Delete Village
  const handleDeleteVillage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this village?"))
      return;
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) {
      alert("Please login again.");
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/admin/villages/${id}`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      alert("Village deleted.");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Deletion failed.");
    }
  };

  if (loading)
    return <div className="dashboard-loading">Loading dashboard...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user?.name || "Admin"}!</p>
        <button className="btn-logout" onClick={logout}>
          Logout
        </button>
      </header>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{stats?.totalVillages || 0}</span>
          <span className="stat-label">Villages</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats?.totalOfficers || 0}</span>
          <span className="stat-label">GN Officers</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats?.totalCitizens || 0}</span>
          <span className="stat-label">Citizens</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {stats?.pendingRegistrations || 0}
          </span>
          <span className="stat-label">Pending Registrations</span>
        </div>
      </div>

      {/* Actions */}
      <div className="action-bar">
        <button
          onClick={() => {
            setModalType("officer");
            setShowModal(true);
          }}
        >
          Add GN Officer
        </button>
        <button
          onClick={() => {
            setModalType("village");
            setShowModal(true);
          }}
        >
          Add Village
        </button>
        <button onClick={fetchData}>Refresh</button>
      </div>

      {/* Officers Table */}
      <section className="section">
        <h2>GN Officers</h2>
        {officers.length === 0 ? (
          <p>No officers yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Village</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {officers.map((o) => (
                <tr key={o._id}>
                  <td>{o.full_name}</td>
                  <td>{o.email}</td>
                  <td>{o.phone}</td>
                  <td>{o.village_id?.name || o.village_id}</td>
                  <td>
                    <button
                      className="btn-danger"
                      onClick={() => handleDeleteOfficer(o._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Villages Table */}
      <section className="section">
        <h2>Villages</h2>
        {villages.length === 0 ? (
          <p>No villages yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>DS Division</th> {/* ✅ Add this column */}
                <th>District</th> {/* ✅ Add this column */}
                <th>Province</th> {/* ✅ Add this column */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {villages.map((v) => (
                <tr key={v._id}>
                  <td>{v.village_id}</td>
                  <td>{v.name}</td>
                  <td>{v.ds_division || "—"}</td> {/* ✅ Display DS Division */}
                  <td>{v.district || "—"}</td> {/* ✅ Display District */}
                  <td>{v.province || "—"}</td> {/* ✅ Display Province */}
                  <td>
                    <button
                      className="btn-danger"
                      onClick={() => handleDeleteVillage(v._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>
              {modalType === "officer" ? "Create GN Officer" : "Add Village"}
            </h2>
            <form
              onSubmit={
                modalType === "officer"
                  ? handleSubmitOfficer
                  : handleSubmitVillage
              }
            >
              {modalType === "officer" ? (
                <>
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
                      <option value="">Select village</option>
                      {villages.map((v) => (
                        <option key={v._id} value={v.village_id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Profile Picture</label>
                    <input
                      type="file"
                      name="profile_picture"
                      accept="image/*"
                      onChange={handleChange}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Village ID *</label>
                    <input
                      type="text"
                      name="village_id_village"
                      value={formData.village_id_village}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Village Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>DS Division *</label>
                    <input
                      type="text"
                      name="ds_division"
                      value={formData.ds_division}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>District *</label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Province *</label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}
              <div className="modal-actions">
                <button type="submit">Save</button>
                <button type="button" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
