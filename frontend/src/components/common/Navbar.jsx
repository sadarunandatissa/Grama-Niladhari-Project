import React from 'react';
import "./Navbar.css";

const Navbar = () => {
    return (
        <header className="navbar">
            <div className="container">
                <div className="logo">Digital Grama Niladhari</div>
                <nav className="nav-links">
                    <a href="#" className="active">Home</a>
                    <a href="#">Announcements</a>
                    <a href="#">Contact</a>
                </nav>
                <div className="nav-actions">
                    <a href="/login" className="btn-login">Login</a>
                    <a href="/register" className="btn-register">Register</a>
                </div>
            </div>
        </header>
    )
}

export default Navbar;