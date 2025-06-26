// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate, useParams, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { isElevatedRole } from "../utils/userRole";

import LoginPage from "../pages/LoginPage/LoginPage";
import SignupPage from "../pages/SignupPage/SignupPage";
import CompanySelectorPage from "../pages/CompanySelector/CompanySelectorPage";
import ClinicSelectorPage from "../pages/ClinicSelector/ClinicSelectorPage";
import CompanyOnboardingPage from "../pages/CompanyOnboardingPage/CompanyOnboardingPage";

import Home from "../pages/Home/Home";
import Dashboard from "../pages/Dashboard/Dashboard";
import PatientsPage from "../pages/Patients/Patients";
import CalendarPage from "../pages/Calendar/Calendar";
import { EmployeesPage } from "../pages/EmployeesPage/EmployeesPage";
import NotificationsPage from "../pages/Notifications/Notifications";
import MessagingPage from "../pages/Messaging/MessagingPage";
import ServicesPage from "../pages/ServicesPage/ServicesPage";

import SettingsPage from "../pages/Settings/SettingsPage";
import UserSettings from "../components/Settings/UserSettings";
import RolesPage from "../pages/Settings/RolesPage";
import ClinicSettings from "../components/Settings/ClinicSettings";
import CompanySettingsPage from "../pages/CompanySettings/CompanySettingsPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import { UserMembership } from "../types/sharedTypes";

function getUserRoleForClinic(
  user: any,
  memberships: UserMembership[],
  companyId: string | null,
  clinicId: string | null
) {
  if (!user || !memberships || !companyId) return undefined;
  const mem =
    memberships.find(
      (m) => m.companyId === companyId && (m.clinicId === clinicId || !clinicId)
    ) || memberships.find((m) => m.companyId === companyId);
  if (Array.isArray(mem?.roles)) return mem.roles[0];
  return mem?.roles;
}

function ClinicLayout() {
  const { selectedClinicId } = useAuth();
  const { clinicId } = useParams<{ clinicId: string }>();
  if (clinicId && selectedClinicId && clinicId !== selectedClinicId) {
    return <Navigate to={`/clinics/${selectedClinicId}`} replace />;
  }
  return <Outlet />;
}

export default function AppRoutes() {
  const {
    idToken,
    user: ctxUser,
    memberships,
    companies,
    checkingCompany,
    needsSignup,
    selectedCompanyId,
    selectedClinicId,
  } = useAuth();
  console.log("AppRoutes", { needsSignup, idToken, ctxUser });

  if (checkingCompany) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Yükleniyor…</p>
      </div>
    );
  }

  // --- FIX: needsSignup guard should be above idToken/user guard ---
  if (needsSignup) {
    return (
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    );
  }

  // This guard comes *after* needsSignup
  if (!idToken || ctxUser === null) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Company onboarding
  const companyMemberships = memberships.filter((m) => m.companyId);
  const uniqueCompanies = Array.from(
    new Set(companyMemberships.map((m) => m.companyId))
  );
  if (!companies || companies.length === 0) {
    return (
      <Routes>
        <Route path="/onboarding" element={<CompanyOnboardingPage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }
  if (!selectedCompanyId && uniqueCompanies.length > 1) {
    return (
      <Routes>
        <Route path="/companies" element={<CompanySelectorPage />} />
        <Route path="*" element={<Navigate to="/companies" replace />} />
      </Routes>
    );
  }
  // Clinic select
  const clinicsForSelectedCompany = memberships.filter(
    (m) => m.companyId === selectedCompanyId && m.clinicId
  );
  if (!selectedClinicId && clinicsForSelectedCompany.length === 0) {
    return (
      <Routes>
        <Route path="/clinics" element={<ClinicSelectorPage />} />
        <Route path="*" element={<Navigate to="/clinics" replace />} />
      </Routes>
    );
  }
  // Main app
  const role = getUserRoleForClinic(
    ctxUser,
    memberships,
    selectedCompanyId,
    selectedClinicId
  );
  const elevated = isElevatedRole(role ?? "staff");
  const settingsRoot = `/clinics/${selectedClinicId}/settings`;

  return (
    <Routes>
      <Route
        path="/login"
        element={<Navigate to={`/clinics/${selectedClinicId}`} replace />}
      />
      {role === "owner" && (
        <Route path="/company-settings" element={<CompanySettingsPage />} />
      )}
      <Route path="/clinics/:clinicId" element={<ClinicLayout />}>
        <Route index element={<Home />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="messaging" element={<MessagingPage />} />
        <Route path="services" element={<ServicesPage />} />
        {/* Settings subtree */}
        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/user" element={<UserSettings />} />
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
      </Route>
      <Route
        path="*"
        element={<Navigate to={`/clinics/${selectedClinicId}`} replace />}
      />
    </Routes>
  );
}
