import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./sideBar.css";
import {
  LayoutDashboard,
  Inbox,
  FileCheckCorner,
  ClipboardCheck,
  UsersRound,
  Megaphone,
  MessageSquare,
  Bell,
  Settings,
  CalendarDays,
  MapPin,
  LogOut,
  Landmark,
} from "lucide-react";

const MENU_SECTIONS = [
  {
    title: null,
    items: [
      { to: "/officer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Main",
    items: [
      { to: "/officer/announcements", label: "Announcements", icon: Megaphone },
      { to: "/pending-verification", label: "Requests", icon: Inbox },
      {
        to: "/officer/certificates",
        label: "Certificates",
        icon: FileCheckCorner,
      },
      { to: "/officer/permits", label: "Permits", icon: ClipboardCheck },
      {
        to: "/officer/appointments",
        label: "Appointments",
        icon: CalendarDays,
      },
    ],
  },
  {
    title: "Community",
    items: [
      { to: "/officer/residents", label: "Citizens", icon: UsersRound },
      {
        to: "/officer/land-management",
        label: "Land Management",
        icon: MapPin,
      },
    ],
  },
  {
    title: "System",
    items: [
      { to: "#", label: "Messages", icon: MessageSquare, disabled: true },
      { to: "#", label: "Alerts", icon: Bell, disabled: true },
      { to: "#", label: "Settings", icon: Settings, disabled: true },
    ],
  },
];

const Sidebar = ({ onLogout }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">
          <Landmark size={20} />
        </span>
        <h2>
          Grama Niladhari
          <span>Management System</span>
        </h2>
      </div>

      <nav className="sidebar-menu">
        {MENU_SECTIONS.map((section, idx) => (
          <div className="menu-section" key={idx}>
            {section.title && (
              <span className="menu-category">{section.title}</span>
            )}

            {section.items.map(({ to, label, icon: Icon, disabled }) =>
              disabled ? (
                <Link key={label} to={to} className="menu-item is-disabled">
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ) : (
                <NavLink
                  key={label}
                  to={to}
                  className={({ isActive }) =>
                    `menu-item ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ),
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="menu-item logout" onClick={onLogout}>
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
