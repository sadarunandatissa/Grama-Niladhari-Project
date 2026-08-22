import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/common/PrivateRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegsterPage";
import RegistrationSuccess from "./components/registration/RegistrationSuccess";
import AdminDashboard from "./pages/AdminDashboard";
import OfficerDashboard from "./pages/OfficerDashboard";
import CitizenDashboard from "./pages/CitizenDashboard";
import LandManagement from "./pages/LandManagement";
import OfficerCertificateManagement from "./pages/OfficerCertificateManagement";
import OfficerCertificateDetails from "./pages/OfficerCertificateDetails";
import CitizenCertificateDetails from "./pages/CitizenCertificateDetails";
import OfficerAppointments from "./pages/OfficerAppointments";
import PendingVerifications from "./components/gn-officer/PendingVerifications";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/registration-success"
            element={<RegistrationSuccess />}
          />
<Route path="/pending-verification" element={<PendingVerifications/>}/>

          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/officer/dashboard"
            element={
              <PrivateRoute allowedRoles={["gn_officer"]}>
                <OfficerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/citizen/dashboard"
            element={
              <PrivateRoute allowedRoles={["citizen"]}>
                <CitizenDashboard />
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
            path="/citizen/certificate/:id"
            element={
              <PrivateRoute allowedRoles={["citizen"]}>
                <CitizenCertificateDetails />
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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
