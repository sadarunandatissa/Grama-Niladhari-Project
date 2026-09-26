import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./ResidentSearch.css";
import {
  UsersRound,
  CircleUserRound,
  Search,
  X,
  RefreshCw,
  Loader2,
} from "lucide-react";

const ResidentSearch = () => {
  const { user, token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // ─── Fetch residents (with optional search) ──────────────
  const fetchResidents = async (search = "") => {
    setLoading(true);
    try {
      const url = `${API_URL}/api/gn-officer/residents?search=${encodeURIComponent(search)}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResidents(res.data.data);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Load all residents on mount ──────────────────────────
  useEffect(() => {
    fetchResidents("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Debounced search when searchTerm changes ─────────────
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchResidents(searchTerm.trim());
    }, 500);
    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // ─── Clear search ─────────────────────────────────────────
  const clearSearch = () => {
    setSearchTerm("");
  };

  // ─── Fetch resident details ──────────────────────────────
  const fetchResidentDetails = async (id) => {
    setDetailLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/gn-officer/residents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedResident(res.data.data);
      setShowDetailModal(true);
    } catch (err) {
      alert("Failed to load resident details.");
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedResident(null);
  };

  return (
    <>
      <header className="topbar">
        <div className="page-title">
          <UsersRound /> Resident Search
        </div>
        <div className="topbar-right">
          <div className="topbar-greeting">
            <span className="greeting-line">{user?.name || "GN Officer"}</span>
            <span className="greeting-sub">
              GN Division {user?.village_id || "N/A"}
            </span>
          </div>
          <div className="profile-avatar">
            <CircleUserRound />
          </div>
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <h5>Search Residents</h5>
            <span className="panel-note">
              Find residents by name, NIC, or phone number
            </span>
          </div>

          <div className="filter-row">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="   Search by Name, NIC, or Phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  className="btn-clear"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              className="btn-refresh"
              onClick={() => fetchResidents(searchTerm.trim())}
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h5>Results</h5>
            {!loading && (
              <span className="panel-total">{residents.length} residents</span>
            )}
          </div>

          {loading && (
            <div className="loading-inline">
              <Loader2 className="spin" size={16} /> Loading residents...
            </div>
          )}

          {!loading && residents.length === 0 && (
            <div className="empty-state">No residents found.</div>
          )}

          {!loading && residents.length > 0 && (
            <div className="land-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>NIC</th>
                    <th>Phone</th>
                    <th>Family</th>
                    <th>Head?</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {residents.map((r) => (
                    <tr key={r._id}>
                      <td className="cell-strong">{r.full_name}</td>
                      <td>{r.nic}</td>
                      <td>{r.phone_numbers?.[0] || "—"}</td>
                      <td>{r.family_id?.family_reg_no || "—"}</td>
                      <td>
                        {r.is_head ? (
                          <span className="badge badge-primary">Head</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-view"
                          onClick={() => fetchResidentDetails(r._id)}
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ─── Resident Detail Modal ──────────────────────── */}
      {showDetailModal && selectedResident && (
        <div className="form-modal-backdrop" onClick={closeModal}>
          <div
            className="form-modal form-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={closeModal}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {detailLoading ? (
              <div className="loading-inline">
                <Loader2 className="spin" size={16} /> Loading details...
              </div>
            ) : (
              <>
                <h3>Resident Full Profile</h3>

                <div className="detail-section">
                  <h4>Personal Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Name</span>
                      <span className="value">
                        {selectedResident.citizen.full_name}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">NIC</span>
                      <span className="value">
                        {selectedResident.citizen.nic}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Date of Birth</span>
                      <span className="value">
                        {new Date(
                          selectedResident.citizen.date_of_birth,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Gender</span>
                      <span className="value">
                        {selectedResident.citizen.gender}
                      </span>
                    </div>
                    <div className="detail-item detail-item-wide">
                      <span className="label">Address</span>
                      <span className="value">
                        {selectedResident.citizen.address}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Phone</span>
                      <span className="value">
                        {selectedResident.citizen.phone_numbers?.join(", ")}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Email</span>
                      <span className="value">
                        {selectedResident.citizen.email || "—"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Occupation</span>
                      <span className="value">
                        {selectedResident.citizen.occupation || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Family Information</h4>
                  {selectedResident.family ? (
                    <>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="label">Family Reg No</span>
                          <span className="value">
                            {selectedResident.family.family_reg_no}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Members</span>
                          <span className="value">
                            {selectedResident.familyMembers.length}
                          </span>
                        </div>
                      </div>
                      <ul className="family-member-list">
                        {selectedResident.familyMembers.map((m) => (
                          <li key={m._id}>
                            <span className="member-name">
                              {m.full_name}
                              {m.is_head && (
                                <span className="badge badge-primary inline">
                                  Head
                                </span>
                              )}
                            </span>
                            <span className="member-meta">
                              {m.nic} &middot; {m.phone_numbers?.[0] || "—"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="empty-note">No family assigned.</p>
                  )}
                </div>

                <div className="detail-section">
                  <h4>Land Records</h4>
                  {selectedResident.lands &&
                  selectedResident.lands.length > 0 ? (
                    <div className="land-table-container nested">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Land ID</th>
                            <th>Survey No</th>
                            <th>Size</th>
                            <th>Type</th>
                            <th>Owner Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedResident.lands.map((l) => (
                            <tr key={l._id}>
                              <td>{l.land_id}</td>
                              <td>{l.survey_number || "—"}</td>
                              <td>
                                {l.size.value} {l.size.unit}
                              </td>
                              <td>{l.type}</td>
                              <td>{l.owner_type}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="empty-note">No land records found.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ResidentSearch;
