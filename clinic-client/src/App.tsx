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

function AppRoutes() {
  const {
    idToken,
    clinicId,

    checkingClinic,

    setClinicId,
    setClinicName,
  } = useAuth();

  if (!idToken) {
    return <Navigate to="/login" replace />;
  }
  if (checkingClinic) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-brand-gray-500">Yükleniyor...</p>
      </div>
    );
  }
  if (!clinicId) {
    return (
      <CreateClinicPage
        idToken={idToken}
        setClinicId={(id) => setClinicId(id)}
        setClinicName={(name) => setClinicName(name)}
      />
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
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
