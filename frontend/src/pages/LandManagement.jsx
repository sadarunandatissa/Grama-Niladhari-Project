import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./LandManagement.css"
import { Plus, Search, ChevronDown, RefreshCw, SquarePen, Trash2 } from "lucide-react";

const LandManagement = ({ onClose }) => {
  const { token } = useAuth();
  const [lands, setLands] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLand, setEditingLand] = useState(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    owner_nic: "",
    size_value: "",
    size_unit: "acres",
    type: "land",
    owner_type: "my_own_land",
    real_owner_nic: "",
    location_description: "",
    survey_number: "",
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // ─── Fetch Data ──────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const [landsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/land`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/land/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setLands(landsRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage("Failed to load land records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ─── Form Handlers ────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear real_owner_nic if owner_type is my_own_land
    if (name === "owner_type" && value === "my_own_land") {
      setFormData((prev) => ({ ...prev, real_owner_nic: "" }));
    }
  };

  const resetForm = () => {
    setFormData({
      owner_nic: "",
      size_value: "",
      size_unit: "acres",
      type: "land",
      owner_type: "my_own_land",
      real_owner_nic: "",
      location_description: "",
      survey_number: "",
    });
    setEditingLand(null);
    setShowModal(false);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const url = editingLand
        ? `${API_URL}/api/land/${editingLand._id}`
        : `${API_URL}/api/land`;
      const method = editingLand ? "put" : "post";

      const response = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(response.data.message);
      resetForm();
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Operation failed.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this land record?"))
      return;
    try {
      await axios.delete(`${API_URL}/api/land/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Land record deleted successfully.");
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Deletion failed.");
    }
  };

  const handleEdit = (land) => {
    setEditingLand(land);
    setFormData({
      owner_nic: land.owner_nic || "",
      size_value: land.size?.value || "",
      size_unit: land.size?.unit || "acres",
      type: land.type || "land",
      owner_type: land.owner_type || "my_own_land",
      real_owner_nic: land.real_owner_nic || "",
      location_description: land.location_description || "",
      survey_number: land.survey_number || "",
    });
    setShowModal(true);
  };

  // ─── Search / Filter ──────────────────────────────────
  const filteredLands = lands.filter((land) => {
    if (
      search &&
      !land.land_id.toLowerCase().includes(search.toLowerCase()) &&
      !land.owner_nic.includes(search) &&
      !land.survey_number?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    if (filterType && land.type !== filterType) return false;
    return true;
  });

  // ─── Render ────────────────────────────────────────────
  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000}}>
      <div 
        className="modal-content-large"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "1100px",
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto",
          position: "relative"
        }}
      >

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "20px",
            background: "transparent",
            border: "none",
            fontSize: "20px",
            cursor: "pointer"
          }}
        >
          ✖
        </button>

        <div className="land-management">
          {/* Header */}
          <div className="land-header">
            <div>
              <h2>Land Management</h2>
              <p className="subtitle">Digital Grama Niladhari Administration System</p>
            </div>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus /> Add Land Record
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="land-stats">
              <div className="stat-card">
                <span className="stat-number">{stats.totalLands}</span>
                <span className="stat-label">Total Lands</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{stats.totalLandType}</span>
                <span className="stat-label">Lands</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{stats.totalPaddyFields}</span>
                <span className="stat-label">Paddy Fields</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{stats.totalAcres}</span>
                <span className="stat-label">Total Acres</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{stats.totalOwnLands}</span>
                <span className="stat-label">Own Lands</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{stats.totalGiftLands}</span>
                <span className="stat-label">Gift Lands</span>
              </div>
            </div>
          )}

          {/* Search & Filter */}
          <div className="filter-card">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18}/>
              <input
                type="text"
                placeholder="Search by Land ID, NIC, or Survey No..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="select-wrapper">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="">All Types</option>
                <option value="land">Land</option>
                <option value="paddy_field">Paddy Field</option>
              </select>
              <div className="select-icon">
                <ChevronDown />
              </div>
            </div>
            <button className="btn-refresh" onClick={fetchData}>
              <RefreshCw className="refresh-icon" size={18}/> Refresh
            </button>
          </div>
          {/* Message */}
          {message && <div className="alert info">{message}</div>}
          {/* Loading */}
          {loading && <div className="loading">Loading land records...</div>}
          {/* Table */}
          {!loading && (
            <div className="land-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Land ID</th>
                    <th>Owner</th>
                    <th>Address</th>
                    <th>Size</th>
                    <th>Type</th>
                    <th>Owner Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLands.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-state">
                        No land records found.
                      </td>
                    </tr>
                  ) : (
                    filteredLands.map((land) => (
                      <tr key={land._id}>
                        <td>
                          <strong>{land.land_id}</strong>
                        </td>
                        <td>
                          {land.owner_name}
                          <br />
                          <small>NIC: {land.owner_nic}</small>
                        </td>
                        <td>{land.owner_address || "N/A"}</td>
                        <td>
                          {land.size.value} {land.size.unit}
                        </td>
                        <td>
                          <span
                            className={`badge ${land.type === "land" ? "badge-blue" : "badge-green"}`}
                          >
                            {land.type === "land" ? "Land" : "Paddy Field"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${land.owner_type === "my_own_land" ? "badge-primary" : "badge-warning"}`}
                          >
                            {land.owner_type === "my_own_land"
                              ? "Own"
                              : "Gift"}
                          </span>
                          {land.real_owner_nic && (
                            <small>
                              <br />
                              Real Owner:{" "}
                              {land.real_owner_name || land.real_owner_nic}
                            </small>
                          )}
                        </td>
                        <td>
                          <div className="action-col">
                            <button
                              className="btn-action"
                              onClick={() => handleEdit(land)}
                            >
                              <SquarePen />
                            </button>
                            <button
                              className="btn-action"
                              onClick={() => handleDelete(land._id)}
                            >
                              <Trash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Table Pagination */}
              <div className="table-pagination">
                <span className="records-info">Showing 1 of 1 records</span>
                <div className="pagination-controls">
                  <button className="btn-page" disabled>Prev</button>
                  <button className="btn-page active">1</button>
                  <button className="btn-page" disabled>Next</button>
                </div>
              </div>
            </div>
          )}
          {/* ─── Modal ──────────────────────────────────────── */}
          {showModal && (
            <div 
              className="inner-modal-backdrop"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1100,
              }}
              onClick={resetForm}
            >
              <div className="modal" style={{ background: "#fff", padding: "20px", borderRadius: "8px", width: "450px" }} 
              onClick={(e) => e.stopPropagation()}>
                <h3>{editingLand ? "Edit Land Record" : "Add Land Record"}</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Owner NIC *</label>
                    <input
                      type="text"
                      name="owner_nic"
                      value={formData.owner_nic}
                      onChange={handleChange}
                      placeholder="e.g., 123456789V"
                      required
                      disabled={!!editingLand}
                    />
                    <small>Must be a registered citizen's NIC</small>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Size *</label>
                      <input
                        type="number"
                        name="size_value"
                        value={formData.size_value}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0.01"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Unit *</label>
                      <select
                        name="size_unit"
                        value={formData.size_unit}
                        onChange={handleChange}
                        required
                      >
                        <option value="acres">Acres</option>
                        <option value="perches">Perches</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Type *</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                      >
                        <option value="land">Land</option>
                        <option value="paddy_field">Paddy Field</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Owner Type *</label>
                      <select
                        name="owner_type"
                        value={formData.owner_type}
                        onChange={handleChange}
                        required
                      >
                        <option value="my_own_land">My Own Land</option>
                        <option value="gift_land">Gift Land</option>
                      </select>
                    </div>
                  </div>
                  {formData.owner_type === "gift_land" && (
                    <div className="form-group">
                      <label>Real Owner NIC *</label>
                      <input
                        type="text"
                        name="real_owner_nic"
                        value={formData.real_owner_nic}
                        onChange={handleChange}
                        placeholder="e.g., 987654321V"
                        required
                      />
                      <small>Must be a registered citizen's NIC</small>
                    </div>
                  )}
                  <div className="form-group">
                    <label>Location Description</label>
                    <input
                      type="text"
                      name="location_description"
                      value={formData.location_description}
                      onChange={handleChange}
                      placeholder="e.g., Near Main Road, Behind Temple"
                    />
                  </div>
                  <div className="form-group">
                    <label>Survey Number</label>
                    <input
                      type="text"
                      name="survey_number"
                      value={formData.survey_number}
                      onChange={handleChange}
                      placeholder="e.g., 123/45"
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn-primary">
                      {editingLand ? "Update" : "Create"}
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandManagement;
