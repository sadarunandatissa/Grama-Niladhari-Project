import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="home-page">
      <h1>GN Administrative System</h1>
      <p>
        Welcome to the digital administrative system for Grama Niladhari
        offices.
      </p>
      <div className="cta-buttons">
        <Link to="/register" className="btn btn-primary">
          Register
        </Link>
        <Link to="/login" className="btn btn-secondary">
          Login
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
