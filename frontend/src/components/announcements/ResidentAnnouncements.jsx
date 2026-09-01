import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./ResidentAnnouncements.css";

const ResidentAnnouncements = () => {
  const { token } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/announcements/resident`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnnouncements(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading)
    return <div className="loading-state">Loading announcements...</div>;

  return (
    <div className="resident-announcements">
      {announcements.length === 0 ? (
        <p className="empty-state">No announcements for your village.</p>
      ) : (
        <div className="announcement-list">
          {announcements.map((a) => (
            <div
              key={a._id}
              className={`announcement-card priority-${a.priority.toLowerCase()}`}
            >
              <div className="announcement-header">
                <h4>{a.title}</h4>
                <span
                  className={`priority-badge priority-badge-${a.priority.toLowerCase()}`}
                >
                  {a.priority}
                </span>
              </div>
              <p>{a.description}</p>
              {a.attachments && a.attachments.length > 0 && (
                <div className="attachments">
                  {a.attachments.map((file, i) => (
                    <a
                      key={i}
                      href={`${API_URL}${file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📎 View attachment
                    </a>
                  ))}
                </div>
              )}
              <small>
                Published: {new Date(a.sentAt || a.createdAt).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResidentAnnouncements;
