import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./sideBar.css";
import {
  LayoutDashboard,
  Plus,
  FileCheckCorner,
  UsersRound,
  Megaphone,
  MessageSquare,
  Smartphone,
  Settings,
  CalendarDays,
  LogOut,
} from "lucide-react";

const Sidebar = ({ onLogout }) => {
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

        <span className="menu-category">MAIN</span>

        <NavLink
          to="/officer/announcements"
          className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
        >
          <Megaphone /> Announcements
        </NavLink>

        <NavLink
          to="/pending-verification"
          className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
        >
          <Plus /> Requests
        </NavLink>

        <NavLink
          to="/officer/certificates"
          className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
        >
          <FileCheckCorner /> Certificates
        </NavLink>

        <NavLink
          to="/officer/residents"
          className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
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
          to="/officer/land-management"
          className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
        >
          <CalendarDays /> Land Management
        </NavLink>

        <NavLink
          to="/officer/permits"
          className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
        >
          <FileCheckCorner /> Permits
        </NavLink>

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
        <button className="menu-item logout" onClick={onLogout}>
          <LogOut /> Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
