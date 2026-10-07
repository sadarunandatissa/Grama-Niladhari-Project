// src/pages/AdminDashboard.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./AdminDashboard.css";

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

  // Main state
  const [stats, setStats] = useState(null);
  const [villages, setVillages] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");

  // Cascading location state
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [dsDivisions, setDSDivisions] = useState([]);
  const [existingVillages, setExistingVillages] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingDS, setLoadingDS] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  // Officer form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    village_id: "",
    profile_picture: null,
  });

  // Village form data (cascading)
  const [villageForm, setVillageForm] = useState({
    province: "",
    district: "",
    ds_division: "",
    name: "",
  });

  // -------------------------
  // Fetch dashboard data
  // -------------------------
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

  // -------------------------
  // Fetch provinces on mount
  // -------------------------
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/location/provinces`);
        setProvinces(res.data);
      } catch (err) {
        console.error("Failed to load provinces:", err);
      }
    };
    fetchProvinces();
  }, [API_URL]);

  // -------------------------
  // When province changes → fetch districts
  // -------------------------
  useEffect(() => {
    if (!villageForm.province) {
      setDistricts([]);
      setDSDivisions([]);
      setExistingVillages([]);
      return;
    }

    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const res = await axios.get(
          `${API_URL}/api/location/districts?provinceId=${villageForm.province}`,
        );
        setDistricts(res.data);
        setDSDivisions([]);
        setExistingVillages([]);
        setVillageForm((prev) => ({
          ...prev,
          district: "",
          ds_division: "",
        }));
      } catch (err) {
        console.error("Failed to load districts:", err);
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchDistricts();
  }, [villageForm.province, API_URL]);

  // -------------------------
  // When district changes → fetch DS divisions
  // -------------------------
  useEffect(() => {
    if (!villageForm.district) {
      setDSDivisions([]);
      setExistingVillages([]);
      return;
    }

    const fetchDS = async () => {
      setLoadingDS(true);
      try {
        const res = await axios.get(
          `${API_URL}/api/location/dsdivisions?districtId=${villageForm.district}`,
        );
        setDSDivisions(res.data);
        setExistingVillages([]);
        setVillageForm((prev) => ({ ...prev, ds_division: "" }));
      } catch (err) {
        console.error("Failed to load DS divisions:", err);
      } finally {
        setLoadingDS(false);
      }
    };
    fetchDS();
  }, [villageForm.district, API_URL]);

  // -------------------------
  // When DS division changes → fetch villages
  // -------------------------
  useEffect(() => {
    if (!villageForm.ds_division) {
      setExistingVillages([]);
      return;
    }

    const fetchVillages = async () => {
      setLoadingVillages(true);
      try {
        const res = await axios.get(
          `${API_URL}/api/location/villages?dsDivisionId=${villageForm.ds_division}`,
        );
        setExistingVillages(res.data);
      } catch (err) {
        console.error("Failed to load villages:", err);
      } finally {
        setLoadingVillages(false);
      }
    };
    fetchVillages();
  }, [villageForm.ds_division, API_URL]);

  // -------------------------
  // Officer form handlers
  // -------------------------
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_picture") {
      setFormData((prev) => ({ ...prev, profile_picture: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleVillageChange = (e) => {
    const { name, value } = e.target;
    setVillageForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      full_name: "",
      phone: "",
      village_id: "",
      profile_picture: null,
    });
    setVillageForm({
      province: "",
      district: "",
      ds_division: "",
      name: "",
    });
    setDistricts([]);
    setDSDivisions([]);
    setExistingVillages([]);
    setShowModal(false);
    setModalType("");
  };

  // -------------------------
  // Create GN Officer
  // -------------------------
  const handleSubmitOfficer = async (e) => {
    e.preventDefault();
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) {
      alert("Please login again.");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "profile_picture" && formData.profile_picture) {
        data.append("profile_picture", formData.profile_picture);
      } else if (key !== "profile_picture") {
        data.append(key, formData[key]);
      }
    });

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

  // -------------------------
  // Create Village (new cascading structure)
  // -------------------------
  const handleSubmitVillage = async (e) => {
    e.preventDefault();
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) {
      alert("Please login again.");
      return;
    }

    if (
      !villageForm.province ||
      !villageForm.district ||
      !villageForm.ds_division
    ) {
      alert("Please select Province, District, and DS Division.");
      return;
    }

    if (!villageForm.name.trim()) {
      alert("Please enter a village name.");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/location/villages`,
        {
          name: villageForm.name.trim(),
          dsDivisionId: villageForm.ds_division,
        },
        { headers: { Authorization: `Bearer ${activeToken}` } },
      );
      alert("Village created successfully!");

      // Refresh existing villages for the same DS division
      const res = await axios.get(
        `${API_URL}/api/location/villages?dsDivisionId=${villageForm.ds_division}`,
      );
      setExistingVillages(res.data);

      // Clear only the name field
      setVillageForm((prev) => ({ ...prev, name: "" }));

      // Refresh main data table
      fetchData();
    } catch (err) {
      console.error("Create village error:", err);
      alert(err.response?.data?.message || "Creation failed.");
    }
  };

  // -------------------------
  // Delete handlers
  // -------------------------
  const handleDeleteOfficer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this GN Officer?"))
      return;
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) return alert("Please login again.");

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

  const handleDeleteVillage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this village?"))
      return;
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) return alert("Please login again.");

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
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user?.name || "Admin"}!</p>
        </div>
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
          className="btn-primary"
          onClick={() => {
            setModalType("officer");
            setShowModal(true);
          }}
        >
          + Add GN Officer
        </button>
        <button
          className="btn-primary"
          onClick={() => {
            setModalType("village");
            setShowModal(true);
          }}
        >
          + Add Village
        </button>
        <button className="btn-secondary" onClick={fetchData}>
          ⟳ Refresh
        </button>
      </div>

      {/* Officers Table */}
      <section className="section">
        <h2>GN Officers</h2>
        <div className="table-card">
          {officers.length === 0 ? (
            <p className="empty-state">No officers yet.</p>
          ) : (
            <div className="table-scroll">
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
            </div>
          )}
        </div>
      </section>

      {/* Villages Table */}
      <section className="section">
        <h2>Villages</h2>
        <div className="table-card">
          {villages.length === 0 ? (
            <p className="empty-state">No villages yet.</p>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Village Name</th>
                    <th>DS Division</th>
                    <th>District</th>
                    <th>Province</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {villages.map((v) => (
                    <tr key={v._id}>
                      <td>{v.name}</td>
                      <td>{v.dsDivision?.name || "—"}</td>
                      <td>{v.dsDivision?.district?.name || "—"}</td>
                      <td>{v.dsDivision?.district?.province?.name || "—"}</td>
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
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>
              {modalType === "officer" ? "Create GN Officer" : "Add Village"}
            </h2>

            {modalType === "officer" ? (
              // ------------- Officer Form -------------
              <form onSubmit={handleSubmitOfficer}>
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
                      <option key={v._id} value={v._id}>
                        {v.name} — {v.dsDivision?.name || ""}
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
                <div className="modal-actions">
                  <button type="submit" className="btn-primary">
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              // ------------- Village Form (Cascading) -------------
              <form onSubmit={handleSubmitVillage}>
                {/* Province */}
                <div className="form-group">
                  <label>Province *</label>
                  <select
                    name="province"
                    value={villageForm.province}
                    onChange={handleVillageChange}
                    required
                  >
                    <option value="">Select Province</option>
                    {provinces.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div className="form-group">
                  <label>District *</label>
                  <select
                    name="district"
                    value={villageForm.district}
                    onChange={handleVillageChange}
                    disabled={!villageForm.province || loadingDistricts}
                    required
                  >
                    <option value="">
                      {loadingDistricts
                        ? "Loading..."
                        : !villageForm.province
                          ? "Select Province first"
                          : "Select District"}
                    </option>
                    {districts.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DS Division */}
                <div className="form-group">
                  <label>DS Division *</label>
                  <select
                    name="ds_division"
                    value={villageForm.ds_division}
                    onChange={handleVillageChange}
                    disabled={!villageForm.district || loadingDS}
                    required
                  >
                    <option value="">
                      {loadingDS
                        ? "Loading..."
                        : !villageForm.district
                          ? "Select District first"
                          : "Select DS Division"}
                    </option>
                    {dsDivisions.map((ds) => (
                      <option key={ds._id} value={ds._id}>
                        {ds.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* New Village Name — dropdown with existing villages as suggestions */}
                <div className="form-group">
                  <label>
                    Village Name *{" "}
                    {villageForm.ds_division && (
                      <span
                        style={{
                          color: "#888",
                          fontWeight: "normal",
                          fontSize: "13px",
                        }}
                      >
                        (
                        {loadingVillages
                          ? "loading..."
                          : `${existingVillages.length} existing`}
                        )
                      </span>
                    )}
                  </label>

                  <input
                    type="text"
                    name="name"
                    list="existing-villages-list"
                    value={villageForm.name}
                    onChange={handleVillageChange}
                    placeholder={
                      !villageForm.ds_division
                        ? "Select DS Division first"
                        : existingVillages.length === 0
                          ? "Type a new village name"
                          : "Select existing or type a new village name"
                    }
                    disabled={!villageForm.ds_division}
                    autoComplete="off"
                    required
                  />

                  {/* Datalist = autocomplete suggestions from existing villages */}
                  <datalist id="existing-villages-list">
                    {existingVillages.map((v) => (
                      <option key={v._id} value={v.name} />
                    ))}
                  </datalist>

                  {villageForm.ds_division &&
                    !loadingVillages &&
                    existingVillages.length === 0 && (
                      <small
                        style={{
                          color: "#888",
                          display: "block",
                          marginTop: "4px",
                        }}
                      >
                        No villages yet in this DS Division — type a name to add
                        the first one.
                      </small>
                    )}
                </div>

                <div className="modal-actions">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={!villageForm.ds_division}
                  >
                    Save Village
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={resetForm}
                  >
                    Close
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
