// frontend/src/App.jsx

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/common/PrivateRoutes";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegsterPage";
import RegistrationSuccess from "./components/registration/RegstrationSuccess";
import AdminDashboard from "./pages/AdminDashboard";
import OfficerDashboard from "./pages/OfficerDashboard";
import CitizenDashboard from "./pages/CitizenDashboard";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/registration-success"
            element={<RegistrationSuccess />}
          />

          {/* Admin only */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* GN Officer only */}
          <Route
            path="/officer/dashboard"
            element={
              <PrivateRoute allowedRoles={["gn_officer"]}>
                <OfficerDashboard />
              </PrivateRoute>
            }
          />

          {/* Citizen only */}
          <Route
            path="/citizen/dashboard"
            element={
              <PrivateRoute allowedRoles={["citizen"]}>
                <CitizenDashboard />
              </PrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
