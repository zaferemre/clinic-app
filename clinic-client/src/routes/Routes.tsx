// src/AppRoutes.tsx

import { Routes, Route, Navigate, useParams, Outlet } from "react-router-dom";

import Home from "../pages/Home/Home";
import PatientsPage from "../pages/Patients/Patients";
import CalendarPage from "../pages/Calendar/Calendar";
import LoginPage from "../pages/LoginPage/LoginPage";
import NotificationsPage from "../pages/Notifications/Notifications";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import MessagingPage from "../pages/Messaging/MessagingPage";
import NewUserPage from "../pages/CompanyOnboardingPage/CompanyOnboardingPage";
import { ServicesPage } from "../pages/ServicesPage/ServicesPage";
import SettingsPage from "../pages/Settings/SettingsPage";
import UserSettings from "../components/Settings/UserSettings";
import RolesPage from "../pages/Settings/RolesPage";
import { ClinicSelectorPage } from "../pages/ClinicSelector/ClinicSelectorPage";
import { useAuth } from "../contexts/AuthContext";
import { EmployeesPage } from "../pages/EmployeesPage/EmployeesPage";
import SelectClinicToJoinPage from "../pages/SelectClinicToJoin/SelectClinicToJoinPage";
import { isElevatedRole } from "../utils/role";
import CompanySettingsPage from "../pages/CompanySettings/CompanySettingsPage";
import ClinicSettings from "../components/Settings/ClinicSettings";

// Layout to force URL-clinicId === selectedClinicId
function ClinicLayout() {
  const { selectedClinicId } = useAuth();
  const { clinicId } = useParams<{ clinicId: string }>();

  if (clinicId && selectedClinicId && clinicId !== selectedClinicId) {
    return <Navigate to={`/clinics/${selectedClinicId}`} replace />;
  }
  return <Outlet />;
}

export default function AppRoutes() {
  const { idToken, companies, checkingCompany, selectedClinicId, user } =
    useAuth();

  if (checkingCompany) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  // 1) Not signed in → only /login
  if (!idToken) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // 2) Signed in but no company → onboarding
  if (!companies || companies.length === 0) {
    return (
      <Routes>
        <Route
          path="/select-clinic-to-join"
          element={<SelectClinicToJoinPage />}
        />
        <Route path="/onboarding" element={<NewUserPage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  // 3) Signed in & company, but no clinic chosen
  if (!selectedClinicId) {
    // Owner: show ClinicSelector and CompanySettings
    if (user?.role === "owner") {
      return (
        <Routes>
          <Route path="/clinics" element={<ClinicSelectorPage />} />
          <Route path="/company-settings" element={<CompanySettingsPage />} />
          <Route path="*" element={<Navigate to="/clinics" replace />} />
        </Routes>
      );
    }
    // Non-owners (employees): Show loading or a message; they should get assigned to a clinic automatically.
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Klinik bulunamadı veya yükleniyor…</p>
      </div>
    );
  }

  // 4) Fully onboarded (clinic is selected)
  const elevated = isElevatedRole(user?.role ?? "staff");
  const settingsRoot = `/clinics/${selectedClinicId}/settings`;

  return (
    <Routes>
      {/* Redirect onboarding if already done */}
      <Route
        path="/onboarding"
        element={<Navigate to={`/clinics/${selectedClinicId}`} replace />}
      />

      {/* Redirect /clinics or /clinics/ to selected clinic */}
      <Route
        path="/clinics"
        element={<Navigate to={`/clinics/${selectedClinicId}`} replace />}
      />
      <Route
        path="/clinics/"
        element={<Navigate to={`/clinics/${selectedClinicId}`} replace />}
      />

      {/* Company Settings: Always accessible to owners even after selecting clinic */}
      {user?.role === "owner" && (
        <Route path="/company-settings" element={<CompanySettingsPage />} />
      )}

      {/* Clinic-scoped routes */}
      <Route path="/clinics/:clinicId" element={<ClinicLayout />}>
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="messaging" element={<MessagingPage />} />
        <Route path="services" element={<ServicesPage />} />

        {/* Settings Overview */}
        <Route path="settings" element={<SettingsPage />} />

        {/* Only elevated roles can access these */}
        <Route
          path="settings/roles"
          element={
            elevated ? <RolesPage /> : <Navigate to={settingsRoot} replace />
          }
        />
        <Route
          path="settings/clinic"
          element={
            elevated ? (
              <ClinicSettings />
            ) : (
              <Navigate to={settingsRoot} replace />
            )
          }
        />

        {/* Always accessible */}
        <Route path="settings/user" element={<UserSettings />} />
      </Route>

      {/* Fallback route */}
      <Route
        path="*"
        element={<Navigate to={`/clinics/${selectedClinicId}`} replace />}
      />
    </Routes>
  );
}
