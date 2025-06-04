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

  if (checkingClinic) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-brand-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  if (!idToken) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (!clinicId) {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <CreateClinicPage idToken={idToken} setClinicId={setClinicId} />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/patients" element={<PatientsPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
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
