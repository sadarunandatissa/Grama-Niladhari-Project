import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./OfficerDashboard.css";
import gnAvatar from "../assets/Officer-Avatar.png";
import LandManagement from "./LandManagement";
import {
  Cross,
  UsersRound,
  Megaphone,
  MessageSquare,
  Smartphone,
  Settings,
  LogOut,
  LayoutDashboard,
  CircleUserRound,
  FileCheckCorner,
  FileStack,
  House,
  Circle,
  Calendar,
  ChevronDown,
  UserRound,
  Download,
} from "lucide-react";

const OfficerDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [notifications, setNotifications] = useState([]);
  const [pendingCertificates, setPendingCertificates] = useState(0);
  const [loading, setLoading] = useState(true);

  // State for Land Management modal popup
  const [showLandModal, setShowLandModal] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get pending certificate count (or any stats)
        const res = await axios.get(
          `${API_URL}/api/certificate/officer/pending`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setPendingCertificates(res.data.data?.length || 0);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, API_URL]);

  // Fetch notifications (if you have this endpoint)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/certificate/officer/notifications`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setNotifications(res.data.data || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, [token, API_URL]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return <div className="loading-spinner">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>
            GRAMA NILADHARI
            <br />
            <span>MANAGEMENT SYSTEM</span>
          </h2>
        </div>

        <nav className="sidebar-menu">
          <Link to="/officer/dashboard" className="menu-item active">
            <LayoutDashboard /> Dashboard
          </Link>

          <span className="menu-category">MAIN</span>
          <Link to="/pending-verification" className="menu-item">
            <Cross /> Requests
          </Link>

          {/* <Link to="/officer/land-management" className="menu-item">
            <House /> Land Management
          </Link> */}

          <button
            type="button"
            className="menu-item menu-button-link"
            onClick={() => setShowLandModal(true)}
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
              <House /> Land Management
            </button>

          <Link to="/officer/certificates" className="menu-item">
            <FileCheckCorner /> Certificates
          </Link>
          <Link to="#" className="menu-item">
            <UsersRound /> Citizens
          </Link>
          <Link to="/officer/appointments" className="menu-item">
            <UsersRound /> Appointments
          </Link>
          <Link to="#" className="menu-item">
            <Megaphone /> Announcements
          </Link>
          <Link to="#" className="menu-item">
            <MessageSquare /> Messages
          </Link>
          <Link to="#" className="menu-item">
            <Smartphone /> Alerts
          </Link>
          <Link to="#" className="menu-item">
            <Settings /> Settings
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="menu-item logout" onClick={handleLogout}>
            <LogOut /> Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <header className="topbar">
          <div className="page-title">
            <LayoutDashboard /> Dashboard
          </div>
          <div className="user-profile">
            <div className="profile-avatar">
              <CircleUserRound />
            </div>
            <div className="profile-info">
              <span className="user-name">{user?.name || "GN OFFICER"}</span>
              <span className="user-role">GRAMA NILADHARI</span>
            </div>
          </div>
        </header>

        <div className="dashboard-grid">
          {/* Welcome card + Quick actions */}
          <div className="upper-grid">
            <div className="welcome-card">
              <div className="welcome-graphic">
                <img src={gnAvatar} alt="GN OFFICER" />
              </div>
              <div className="welcome-text">
                <h3>GOOD MORNING !</h3>
                <p className="title-sub">GRAMA NILADHARI OFFICER</p>
                <div className="division-badge">
                  GN DIVISION{" "}
                  <span className="badge-num">{user?.village_id || "N/A"}</span>
                </div>
                <p className="date-stamp">
                  Today is {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="quick-actions-grid">
              <button className="action-btn">
                <Cross /> Requests
              </button>
              <button className="action-btn">
                <UsersRound /> Citizens
              </button>
              <button className="action-btn">
                <Megaphone /> Announcements
              </button>
              <button className="action-btn">
                <MessageSquare /> Messages
              </button>
            </div>
          </div>

          <div className="notice-strip">IMPORTANT NOTICES</div>

          {/* Status summary row */}
          <div className="status-summary-row">
            {/* Certificate Requests */}
            <div className="status-card border-blue">
              <div className="card-head">
                <div className="card-head-icon">
                  <FileCheckCorner />
                </div>
                <h4>Certificate Requests</h4>
              </div>
              <div className="counter-badge-row">
                <div className="badge-box bg-blue">
                  <span>Pending</span>
                  <strong>{pendingCertificates}</strong>
                </div>
                <div className="badge-box bg-blue">
                  <span>Approved</span>
                  <strong>--</strong>
                </div>
                <div className="badge-box bg-blue">
                  <span>Rejected</span>
                  <strong>--</strong>
                </div>
              </div>
              <div className="mini-list">
                <div className="list-item">Request 1</div>
                <div className="list-item">Request 2</div>
              </div>
            </div>

            {/* Permit Requests */}
            <div className="status-card border-green">
              <div className="card-head">
                <div className="card-head-icon">
                  <FileStack />
                </div>
                <h4>Permit Requests</h4>
              </div>
              <div className="counter-badge-row">
                <div className="badge-box bg-green">
                  <span>Pending</span>
                  <strong>--</strong>
                </div>
                <div className="badge-box bg-green">
                  <span>Approved</span>
                  <strong>--</strong>
                </div>
                <div className="badge-box bg-green">
                  <span>Rejected</span>
                  <strong>--</strong>
                </div>
              </div>
              <div className="mini-list">
                <div className="list-item">Request 1</div>
                <div className="list-item">Request 2</div>
              </div>
            </div>

            {/* Citizen details */}
            <div className="status-card border-orange">
              <div className="card-head">
                <div className="card-head-icon">
                  <House />
                </div>
                <h4>Citizen details</h4>
              </div>
              <div className="stat-rows-group">
                <div className="stat-row">
                  <span>Total Citizens:</span>
                  <strong className="val-box">--</strong>
                </div>
                <div className="stat-row">
                  <span>Total Families:</span>
                  <strong className="val-box">--</strong>
                </div>
                <div className="stat-row">
                  <span>Total Houses:</span>
                  <strong className="val-box">--</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Charts row */}
          <div className="visuals-row">
            <div className="chart-card flex-double">
              <div className="chart-header">
                <h5>Monthly Requests Overview</h5>
                <div className="chart-legend">
                  <span className="blue">
                    <Circle /> Certificate Requests
                  </span>
                  <span className="green">
                    <Circle /> Permit Requests
                  </span>
                </div>
              </div>
              <div className="graph-bars"></div>
              <div className="graph-summary-tiles">
                <div className="tile">
                  <span>Total Certificate Requests</span>
                  <strong>--</strong>
                </div>
                <div className="tile">
                  <span>Total Permit Requests</span>
                  <strong>--</strong>
                </div>
                <div className="tile">
                  <span>Highest Month (Certificates)</span>
                  <strong>--</strong>
                </div>
                <div className="tile">
                  <span>Highest Month (Permits)</span>
                  <strong>--</strong>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <h5>Citizen Details</h5>
                  <span className="sub-caption">
                    Overview of Citizens, Families and Houses
                  </span>
                </div>
                <div className="dropdown-mock">
                  <Calendar /> This Year <ChevronDown />
                </div>
              </div>
              <div className="mock-pie-layout">
                <div className="pie-donut-graphic"></div>
                <div className="pie-breakdown-list">
                  <div className="breakdown-item">
                    <span className="lbl">
                      <UserRound /> Total Citizens
                    </span>
                    <strong>--</strong>
                  </div>
                  <div className="breakdown-item">
                    <span className="lbl">
                      <UserRound /> Total Families
                    </span>
                    <strong>--</strong>
                  </div>
                  <div className="breakdown-item">
                    <span className="lbl">
                      <UserRound /> Total Houses
                    </span>
                    <strong>--</strong>
                  </div>
                </div>
              </div>
              <div className="chart-card-footer">
                <p>
                  This chart represents the distribution of citizens, families,
                  and houses
                </p>
                <button className="btn-download-report">
                  <Download /> Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Render the Land Management Modal when active */}
      {showLandModal && (
        <LandManagement onClose={() => setShowLandModal(false)} />
      )}
    </div>
  );
};

export default OfficerDashboard;