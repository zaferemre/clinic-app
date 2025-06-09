// src/AppRoutes.tsx

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home/Home";
import PatientsPage from "./pages/Patients/Patients";
import CalendarPage from "./pages/Calendar/Calendar";
import LoginPage from "./pages/LoginPage/LoginPage";
import NotificationsPage from "./pages/Notifications/Notifications";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { MessagingPage } from "./pages/Messaging/MessagingPage";
import EditPatientPage from "./pages/EditPatientPage/EditPatientPage";
import NewUserPage from "./pages/CompanyOnboardingPage/CompanyOnboardingPage";
import EmployeesPage from "./components/EmployeesPage/EmployeesPage";
import { AuthContextProvider, useAuth } from "./contexts/AuthContext";
import { ServicesPage } from "./pages/ServicesPage/ServicesPage";
import SettingsPage from "./pages/Settings/SettingsPage";

function AppRoutes() {
  const { idToken, companyId, checkingCompany } = useAuth();

  if (checkingCompany) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-brand-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  // 1) Not authenticated → only login
  if (!idToken) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // 2) Authenticated but no company yet → onboarding
  //    any route other than /onboarding redirects back there
  if (!companyId) {
    return (
      <Routes>
        <Route path="/onboarding" element={<NewUserPage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  // 3) Authenticated and inside a company → the app
  return (
    <Routes>
      {/* once you have a company, landing at /onboarding bounces to home */}
      <Route path="/onboarding" element={<Navigate to="/" replace />} />

      <Route path="/" element={<Home />} />
      <Route path="/patients" element={<PatientsPage />} />
      <Route path="/patients/:id/edit" element={<EditPatientPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/employees" element={<EmployeesPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/messaging" element={<MessagingPage />} />
      <Route path="/services" element={<ServicesPage />} />
      {/* if someone goes to /login after login, send them home */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthContextProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthContextProvider>
  );
}
