import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./OfficerAnnouncements.css";

const PRIORITY_OPTIONS = ["Normal", "Important", "Urgent", "Emergency"];

const OfficerAnnouncements = () => {
  const { token } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Normal",
    targetAudience: "all",
    specificNICs: "",
    publishMode: "immediate",
    scheduledAt: "",
    startDate: "",
    endDate: "",
    attachments: [],
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/announcements/officer`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnouncements(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, attachments: files }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "Normal",
      targetAudience: "all",
      specificNICs: "",
      publishMode: "immediate",
      scheduledAt: "",
      startDate: "",
      endDate: "",
      attachments: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("priority", formData.priority);
    data.append("targetAudience", formData.targetAudience);
    if (formData.targetAudience === "specific") {
      const nics = formData.specificNICs
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      nics.forEach((nic) => data.append("specificNICs[]", nic));
    }
    data.append("publishMode", formData.publishMode);
    if (formData.publishMode === "scheduled") {
      data.append("scheduledAt", new Date(formData.scheduledAt).toISOString());
    }
    if (formData.startDate)
      data.append("startDate", new Date(formData.startDate).toISOString());
    if (formData.endDate)
      data.append("endDate", new Date(formData.endDate).toISOString());
    for (let file of formData.attachments) {
      data.append("attachments", file);
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/announcements/officer`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      setMessage(res.data.message || "Announcement published.");
      setMessageType("success");
      resetForm();
      setShowForm(false);
      fetchAnnouncements();
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to create announcement.",
      );
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    // delete logic
  };

  const pendingCount = announcements.filter(
    (a) => a.status?.toLowerCase() === "pending",
  ).length;

  if (loading) {
    return (
      <div className="officer-announcements">
        <div className="loading-state">Loading announcements…</div>
      </div>
    );
  }

  return (
    <div className="officer-announcements">
      <div className="header">
        <div className="header-title">
          <span className="header-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 11v2a1 1 0 0 0 1 1h2l3.5 3.5a1 1 0 0 0 1.7-.7V7.2a1 1 0 0 0-1.7-.7L6 10H4a1 1 0 0 0-1 1Z" />
              <path d="M15.5 8.5a4 4 0 0 1 0 7" />
              <path d="M18.5 6a8 8 0 0 1 0 12" />
            </svg>
          </span>
          <div>
            <h2>Announcements</h2>
            <p className="header-subtitle">
              {announcements.length} total
              {pendingCount > 0 ? ` · ${pendingCount} pending` : ""}
            </p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Announcement"}
        </button>
      </div>

      {message && (
        <div
          className={`alert ${messageType === "success" ? "success" : messageType === "error" ? "error" : "info"}`}
        >
          {message}
        </div>
      )}

      {showForm && (
        <form className="announcement-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Water supply interruption notice"
              required
              maxLength="100"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Details residents need to know"
              required
              rows="5"
              maxLength="2000"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <div className="pill-select">
                {PRIORITY_OPTIONS.map((level) => (
                  <label
                    key={level}
                    className={`pill-option priority-pill-${level.toLowerCase()} ${
                      formData.priority === level ? "is-selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={level}
                      checked={formData.priority === level}
                      onChange={handleChange}
                    />
                    {level}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Target Audience</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="targetAudience"
                    value="all"
                    checked={formData.targetAudience === "all"}
                    onChange={handleChange}
                  />
                  All Citizens
                </label>
                <label>
                  <input
                    type="radio"
                    name="targetAudience"
                    value="specific"
                    checked={formData.targetAudience === "specific"}
                    onChange={handleChange}
                  />
                  Specific Citizens
                </label>
              </div>
              {formData.targetAudience === "specific" && (
                <input
                  type="text"
                  name="specificNICs"
                  value={formData.specificNICs}
                  onChange={handleChange}
                  placeholder="Enter NICs separated by commas"
                />
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Publish</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="publishMode"
                    value="immediate"
                    checked={formData.publishMode === "immediate"}
                    onChange={handleChange}
                  />
                  Immediately
                </label>
                <label>
                  <input
                    type="radio"
                    name="publishMode"
                    value="scheduled"
                    checked={formData.publishMode === "scheduled"}
                    onChange={handleChange}
                  />
                  Schedule
                </label>
              </div>
              {formData.publishMode === "scheduled" && (
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={handleChange}
                  required
                />
              )}
            </div>

            <div className="form-group">
              <label>Validity Period</label>
              <div className="date-range">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
                <span className="date-range-sep">to</span>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
              <small>Optional start and end dates for visibility</small>
            </div>
          </div>

          <div className="form-group">
            <label>Attachments (optional)</label>
            <input
              type="file"
              name="attachments"
              multiple
              onChange={handleChange}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <small>PDF, JPG, PNG · max 5 files</small>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? "Publishing…" : "Publish Announcement"}
            </button>
          </div>
        </form>
      )}

      <div className="announcements-list">
        <div className="list-header">
          <h3>Recent Announcements</h3>
        </div>

        {announcements.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="6" width="18" height="14" rx="2" />
                <path d="M3 7.5 12 14l9-6.5" />
              </svg>
            </span>
            <p>No announcements yet.</p>
            <span className="empty-hint">
              Create one to notify citizens in your division.
            </span>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Priority</th>
                <th>Audience</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((a) => (
                <tr key={a._id}>
                  <td className="cell-title">{a.title}</td>
                  <td>
                    <span
                      className={`priority-badge priority-${a.priority.toLowerCase()}`}
                    >
                      {a.priority}
                    </span>
                  </td>
                  <td>
                    {a.targetAudience === "all"
                      ? "All"
                      : `${a.specificNICs.length} citizen(s)`}
                  </td>
                  <td>
                    <span
                      className={`status-badge status-${a.status?.toLowerCase()}`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="cell-muted">
                    {new Date(a.createdAt).toLocaleString()}
                  </td>
                  <td className="cell-actions">
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(a._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OfficerAnnouncements;
