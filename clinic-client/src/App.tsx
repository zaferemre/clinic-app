// src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home/Home";
import PatientsPage from "./pages/Patients/Patients";
import CalendarPage from "./pages/Calendar/Calendar";
import CreateClinicPage from "./pages/CreateClinic/CreateClinic";
import LoginPage from "./pages/LoginPage/LoginPage";

import { AuthContextProvider, useAuth } from "./context/AuthContext";

function AppRoutes() {
  const { idToken, clinicId, checkingClinic, setClinicId } = useAuth();

  // 1) While we’re still checking (e.g. fetching “does this user have a clinic?”), show a loading screen:
  if (checkingClinic) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-brand-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  // 2) If there is no idToken, force everyone to /login:
  if (!idToken) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // 3) We do have an idToken, but no clinicId yet → force everyone to /create-clinic:
  if (!clinicId) {
    return (
      <Routes>
        <Route
          path="/create-clinic"
          element={
            <CreateClinicPage idToken={idToken} setClinicId={setClinicId} />
          }
        />
        <Route path="*" element={<Navigate to="/create-clinic" replace />} />
      </Routes>
    );
  }

  // 4) We have both idToken AND clinicId → show “main” app routes.
  //    Also lock down /login and /create-clinic so they bounce back to "/".
  return (
    <Routes>
      {/* If a logged-in user tries to go back to /login or /create-clinic, redirect to / */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/create-clinic" element={<Navigate to="/" replace />} />

      {/* Main app pages */}
      <Route path="/" element={<Home />} />
      <Route path="/patients" element={<PatientsPage />} />
      <Route path="/calendar" element={<CalendarPage />} />

      {/* Anything else → redirect to "/" */}
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
