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

import { AuthContextProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage/LoginPage";

function AppRoutes() {
  const {
    idToken,
    clinicId,

    checkingClinic,

    setClinicId,
  } = useAuth();

  if (checkingClinic) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-brand-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={
          idToken ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage
              onSignOut={signOut}
              setClinicId={setClinicId}
              setClinicName={setClinicName}
            />
          )
        }
      />
      <Route path="/patients" element={<PatientsPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
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
