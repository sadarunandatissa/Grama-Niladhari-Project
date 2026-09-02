// src/App.jsx

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/common/PrivateRoute";

// ─── Public Pages ──────────────────────────────────────────
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegsterPage"; // ✅ FIXED: was "RegsterPage"
import RegistrationSuccess from "./components/registration/RegistrationSuccess";

// ─── Admin Pages ───────────────────────────────────────────
import AdminDashboard from "./pages/AdminDashboard";

// ─── GN Officer Pages ──────────────────────────────────────
import OfficerDashboard from "./pages/OfficerDashboard";
import LandManagement from "./pages/LandManagement";
import OfficerCertificateManagement from "./pages/OfficerCertificateManagement";
import OfficerCertificateDetails from "./pages/OfficerCertificateDetails";
import OfficerAppointments from "./pages/OfficerAppointments";
import OfficerAnnouncements from "./pages/OfficerAnnouncements";
import OfficerPermits from "./pages/OfficerPermits";

// ─── Citizen Pages ─────────────────────────────────────────
import CitizenDashboard from "./pages/CitizenDashboard";
import CitizenCertificateDetails from "./pages/CitizenCertificateDetails";

// ─── Shared / Child Components ────────────────────────────
import PendingVerifications from "./components/gn-officer/PendingVerifications";
import ResidentAnnouncements from "./components/announcements/ResidentAnnouncements";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ═══════════════════════════════════════════════════ */}
          {/* PUBLIC ROUTES                                      */}
          {/* ═══════════════════════════════════════════════════ */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/registration-success"
            element={<RegistrationSuccess />}
          />

          {/* ═══════════════════════════════════════════════════ */}
          {/* ADMIN ROUTES (admin only)                         */}
          {/* ═══════════════════════════════════════════════════ */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* ═══════════════════════════════════════════════════ */}
          {/* GN OFFICER ROUTES (gn_officer only)              */}
          {/* ═══════════════════════════════════════════════════ */}
          <Route
            path="/officer/dashboard"
            element={
              <PrivateRoute allowedRoles={["gn_officer"]}>
                <OfficerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/pending-verification"
            element={
              <PrivateRoute allowedRoles={["gn_officer"]}>
                <PendingVerifications />
              </PrivateRoute>
            }
          />
          <Route
            path="/officer/land-management"
            element={
              <PrivateRoute allowedRoles={["gn_officer"]}>
                <LandManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/officer/certificates"
            element={
              <PrivateRoute allowedRoles={["gn_officer"]}>
                <OfficerCertificateManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/officer/certificate/:id"
            element={
              <PrivateRoute allowedRoles={["gn_officer"]}>
                <OfficerCertificateDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/officer/appointments"
            element={
              <PrivateRoute allowedRoles={["gn_officer"]}>
                <OfficerAppointments />
              </PrivateRoute>
            }
          />
          <Route
            path="/officer/announcements"
            element={
              <PrivateRoute allowedRoles={["gn_officer"]}>
                <OfficerAnnouncements />
              </PrivateRoute>
            }
          />
          <Route
            path="/officer/permits"
            element={
              <PrivateRoute allowedRoles={["gn_officer"]}>
                <OfficerPermits />
              </PrivateRoute>
            }
          />

          {/* ═══════════════════════════════════════════════════ */}
          {/* CITIZEN ROUTES (citizen only)                     */}
          {/* ═══════════════════════════════════════════════════ */}
          <Route
            path="/citizen/dashboard"
            element={
              <PrivateRoute allowedRoles={["citizen"]}>
                <CitizenDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/citizen/certificate/:id"
            element={
              <PrivateRoute allowedRoles={["citizen"]}>
                <CitizenCertificateDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/citizen/announcements"
            element={
              <PrivateRoute allowedRoles={["citizen"]}>
                <ResidentAnnouncements />
              </PrivateRoute>
            }
          />

          {/* ═══════════════════════════════════════════════════ */}
          {/* FALLBACK / 404                                     */}
          {/* ═══════════════════════════════════════════════════ */}
          <Route
            path="*"
            element={
              <div style={{ padding: 40, textAlign: "center" }}>
                Page not found
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
