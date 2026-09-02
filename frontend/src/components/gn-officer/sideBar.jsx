import React from "react";
import { Link } from "react-router-dom";
import "./sideBar.css";
import {
  LayoutDashboard,
  House,
  Cross,
  FileCheckCorner,
  UsersRound,
  Megaphone,
  MessageSquare,
  Smartphone,
  Settings,
  LogOut,
} from "lucide-react";

const Sidebar = ({
  activePath = "/officer/dashboard",
  onOpenLandModal,
  onLogout,
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>
          GRAMA NILADHARI
          <br />
          <span>MANAGEMENT SYSTEM</span>
        </h2>
      </div>

      <nav className="sidebar-menu">
        <Link
          to="/officer/dashboard"
          className={`menu-item ${activePath === "/officer/dashboard" ? "active" : ""}`}
        >
          <LayoutDashboard /> Dashboard
        </Link>

        {/* <span className="menu-category">MAIN</span> */}
        <Link
          to="/pending-verification"
          className={`menu-item ${activePath === "/pending-verification" ? "active" : ""}`}
        >
          <Cross /> Requests
        </Link>

        {/* <Link to="/officer/land-management" className="menu-item">
            <House /> Land Management
          </Link> */}

        <button
          type="button"
          className="menu-item menu-button-link"
          onClick={onOpenLandModal}
          style={{
            background: "none",
            border: "none",
            width: "100%",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
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
        <Link to="/officer/permits" className="menu-item">
          <MessageSquare /> Permits
        </Link>

        <Link to="#" className="menu-item">
          <Smartphone /> Alerts
        </Link>

        <Link to="#" className="menu-item">
          <Settings /> Settings
        </Link>
      </nav>

      <div className="sidebar-footer">
        <button className="menu-item logout" onClick={onLogout}>
          <LogOut /> Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
