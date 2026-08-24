import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

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
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, attachments: files }));
    } else if (type === "radio") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
      setMessage(res.data.message);
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
      setShowForm(false);
      fetchAnnouncements();
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to create announcement.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="officer-announcements">
      <div className="header">
        <h2>📢 Announcements</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Announcement"}
        </button>
      </div>

      {message && <div className="alert info">{message}</div>}

      {showForm && (
        <form className="announcement-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
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
              required
              rows="5"
              maxLength="2000"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="priority"
                    value="Normal"
                    checked={formData.priority === "Normal"}
                    onChange={handleChange}
                  />{" "}
                  Normal
                </label>
                <label>
                  <input
                    type="radio"
                    name="priority"
                    value="Important"
                    checked={formData.priority === "Important"}
                    onChange={handleChange}
                  />{" "}
                  Important
                </label>
                <label>
                  <input
                    type="radio"
                    name="priority"
                    value="Urgent"
                    checked={formData.priority === "Urgent"}
                    onChange={handleChange}
                  />{" "}
                  Urgent
                </label>
                <label>
                  <input
                    type="radio"
                    name="priority"
                    value="Emergency"
                    checked={formData.priority === "Emergency"}
                    onChange={handleChange}
                  />{" "}
                  Emergency
                </label>
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
                  />{" "}
                  All Citizens
                </label>
                <label>
                  <input
                    type="radio"
                    name="targetAudience"
                    value="specific"
                    checked={formData.targetAudience === "specific"}
                    onChange={handleChange}
                  />{" "}
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
                  />{" "}
                  Immediately
                </label>
                <label>
                  <input
                    type="radio"
                    name="publishMode"
                    value="scheduled"
                    checked={formData.publishMode === "scheduled"}
                    onChange={handleChange}
                  />{" "}
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
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
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
            <small>PDF, JPG, PNG (max 5 files)</small>
          </div>
          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? "Publishing..." : "Publish Announcement"}
          </button>
        </form>
      )}

      <div className="announcements-list">
        {announcements.length === 0 ? (
          <p>No announcements yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Priority</th>
                <th>Audience</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((a) => (
                <tr key={a._id}>
                  <td>{a.title}</td>
                  <td>
                    <span className={`priority-${a.priority.toLowerCase()}`}>
                      {a.priority}
                    </span>
                  </td>
                  <td>
                    {a.targetAudience === "all"
                      ? "All"
                      : `${a.specificNICs.length} citizen(s)`}
                  </td>
                  <td>{a.status}</td>
                  <td>{new Date(a.createdAt).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => {
                        /* delete logic */
                      }}
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
