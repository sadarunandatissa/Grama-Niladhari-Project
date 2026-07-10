import React from "react";
import { Link, useLocation } from "react-router-dom";

const RegistrationSuccess = () => {
  const location = useLocation();
  const message =
    location.state?.message || "Registration submitted successfully!";

  return (
    <div className="success-container">
      <div className="success-card">
        <h2>✅ Registration Submitted</h2>
        <p>{message}</p>
        <p>
          You will receive a notification once your GN officer verifies your
          account.
        </p>
        <Link to="/" className="btn btn-primary">
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
