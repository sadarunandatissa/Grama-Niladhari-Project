import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/gn-officer/sideBar";
import "./OfficerLayout.css"

const OfficerLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    }
    ;

    return (
        <div className="officer-layout">
            <Sidebar 
                onLogout={handleLogout}
            />

            <main className="officer-main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default OfficerLayout;