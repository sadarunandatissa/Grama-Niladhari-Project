import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/common/PrivateRoutes";

// Pages & Components
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegsterPage";
import LoginPage from "./pages/LoginPage";
import OfficerDashboardPage from "./pages/OfficerDashboard";
import RegistrationSuccess from "./components/registration/RegstrationSuccess";

// Import your registration form (or use it directly in RegisterPage)
import RegistrationForm from "./components/registration/RegistrationForm";
import PendingVerifications from "./components/gn-officer/PendingVerifications";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/registration-success"
              element={<RegistrationSuccess />}
            />

            {/* Protected Routes */}
            <Route
              path="/officer-dashboard"
              element={
                <PrivateRoute allowedRoles={["gn_officer"]}>
                  <OfficerDashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/officer/pending"
              element={
                <PrivateRoute allowedRoles={["gn_officer"]}>
                  <PendingVerifications />
                </PrivateRoute>
              }
            />

            {/* Optional: citizen dashboard, etc. */}
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
