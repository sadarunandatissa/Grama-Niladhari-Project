import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./CertificateComponents.css";

const CitizenNotifications = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/certificate/notifications`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setNotifications(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const markRead = async (id) => {
    try {
      await axios.put(
        `${API_URL}/api/certificate/notification/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return <div className="cert-loading">Loading notifications...</div>;

  return (
    <div className="notifications-panel">
      {notifications.length === 0 ? (
        <p className="cert-empty">No notifications.</p>
      ) : (
        <ul className="notification-list">
          {notifications.map((n) => (
            <li
              key={n._id}
              className={`notification-item ${n.isRead ? "read" : "unread"}`}
            >
              <div className="notification-dot" />
              <div className="notification-body">
                <strong>{n.title}</strong>
                <p>{n.message}</p>
                <small>{new Date(n.createdAt).toLocaleString()}</small>
              </div>
              {!n.isRead && (
                <button
                  className="btn-mark-read"
                  onClick={() => markRead(n._id)}
                >
                  Mark as read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CitizenNotifications;
