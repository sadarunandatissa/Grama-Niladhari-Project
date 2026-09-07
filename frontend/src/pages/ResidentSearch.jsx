// src/pages/ResidentSearch.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
// import './ResidentSearch.css';

const ResidentSearch = () => {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Search residents
  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      setResidents([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      fetchResidents();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/gn-officer/residents?search=${encodeURIComponent(searchTerm)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setResidents(res.data.data);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="resident-search-page">
      <h2>🔍 Resident Search</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by Name, NIC, or Phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {loading && <span className="loading-indicator">Searching...</span>}
      </div>

      <div className="results-table-container">
        {residents.length === 0 && searchTerm.trim() !== "" && !loading && (
          <p className="no-results">No residents found.</p>
        )}
        {residents.length > 0 && (
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
                  <td>{r.full_name}</td>
                  <td>{r.nic}</td>
                  <td>{r.phone_numbers?.[0] || "—"}</td>
                  <td>{r.family_id?.family_reg_no || "—"}</td>
                  <td>{r.is_head ? "✅" : "—"}</td>
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
        )}
      </div>

      {/* ─── Resident Detail Modal ──────────────────────── */}
      {showDetailModal && selectedResident && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>
            {detailLoading ? (
              <div>Loading details...</div>
            ) : (
              <>
                <h3>Resident Full Profile</h3>
                <div className="detail-section">
                  <h4>Personal Information</h4>
                  <p>
                    <strong>Name:</strong> {selectedResident.citizen.full_name}
                  </p>
                  <p>
                    <strong>NIC:</strong> {selectedResident.citizen.nic}
                  </p>
                  <p>
                    <strong>Date of Birth:</strong>{" "}
                    {new Date(
                      selectedResident.citizen.date_of_birth,
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Gender:</strong> {selectedResident.citizen.gender}
                  </p>
                  <p>
                    <strong>Address:</strong> {selectedResident.citizen.address}
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    {selectedResident.citizen.phone_numbers?.join(", ")}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {selectedResident.citizen.email || "—"}
                  </p>
                  <p>
                    <strong>Occupation:</strong>{" "}
                    {selectedResident.citizen.occupation || "—"}
                  </p>
                </div>

                <div className="detail-section">
                  <h4>Family Information</h4>
                  {selectedResident.family ? (
                    <>
                      <p>
                        <strong>Family Reg No:</strong>{" "}
                        {selectedResident.family.family_reg_no}
                      </p>
                      <p>
                        <strong>
                          Family Members (
                          {selectedResident.familyMembers.length})
                        </strong>
                      </p>
                      <ul>
                        {selectedResident.familyMembers.map((m) => (
                          <li key={m._id}>
                            {m.full_name} {m.is_head ? "(Head)" : ""} – {m.nic}{" "}
                            – {m.phone_numbers?.[0] || ""}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p>No family assigned.</p>
                  )}
                </div>

                <div className="detail-section">
                  <h4>Land Records</h4>
                  {selectedResident.lands &&
                  selectedResident.lands.length > 0 ? (
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
                  ) : (
                    <p>No land records found.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentSearch;
