import React from "react";
import { Link, NavLink } from "react-router-dom";
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
  CalendarDays,
  LogOut,
} from "lucide-react";

const Sidebar = ({ onOpenLandModal, onLogout }) => {
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
        <NavLink
          to="/officer/dashboard"
          className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
        >
          <LayoutDashboard /> Dashboard
        </NavLink>

        {/* <span className="menu-category">MAIN</span> */}
        <NavLink
          to="/pending-verification"
          className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
        >
          <Cross /> Requests
        </NavLink>

                <NavLink 
                    to="/officer/land-management" 
                    className={({ isActive }) =>
                        `menu-item ${isActive ? "active" : ""}`
                    }
                >
                    <House /> Land Management
                </NavLink>

        {/* <button
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
        </button> */}

        <NavLink
          to="/officer/certificates"
          className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
        >
          <FileCheckCorner /> Certificates
        </NavLink>

          <NavLink 
              to="/officer/citizens" 
              className={({ isActive }) =>
                `menu-item ${isActive ? "active" : ""}`
              }
              >
              <UsersRound /> Citizens
          </NavLink>

        <NavLink
          to="/officer/appointments"
          className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
        >
          <CalendarDays /> Appointments
        </NavLink>

        <NavLink
          to="/officer/announcements"
          className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
        >
          <Megaphone /> Announcements
        </NavLink>

                <NavLink 
                    to="/officer/permits" 
                    className={({ isActive }) =>
                        `menu-item ${isActive ? "active" : ""}`
                    }
                >
                    <CalendarDays /> Permits
                </NavLink>

                <NavLink 
                    to="/officer/alerts" 
                    className={({ isActive }) =>
                        `menu-item ${isActive ? "active" : ""}`
                    }
                >
                    <Smartphone /> Alerts
                </NavLink>

                <NavLink 
                    to="/officer/settings" 
                    className={({ isActive }) =>
                        `menu-item ${isActive ? "active" : ""}`
                    }
                >
                    <Settings /> Settings
                </NavLink>
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
