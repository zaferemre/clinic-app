import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CogIcon,
  UserIcon,
  BuildingStorefrontIcon,
  BellIcon,
  SunIcon,
  LockClosedIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";
import { PatientSettingsModal } from "../../components/Modals/PatientSettingsModal";
import { PatientSettings } from "../../types/sharedTypes";
const settingsOptions = [
  { label: "Profil", icon: UserIcon, path: "/settings/user" },
  {
    label: "Şirket Bilgileri",
    icon: BuildingStorefrontIcon,
    path: "/settings/company",
  },
  {
    label: "Bildirim Ayarları",
    icon: BellIcon,
    path: "/settings/notifications",
  },
  { label: "Görünüm", icon: SunIcon, path: "/settings/appearance" },
  { label: "Güvenlik", icon: LockClosedIcon, path: "/settings/security" },
];

const DEFAULT_PATIENT_SETTINGS: PatientSettings = {
  showCredit: true,
  showPaymentStatus: true,
  showServicesReceived: true,
  showServicePointBalance: true,
  showNotes: false,
};

export const SettingsPage: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientSettings, setPatientSettings] = useState<PatientSettings>(
    DEFAULT_PATIENT_SETTINGS
  );

  useEffect(() => {
    const saved = localStorage.getItem("patientSettings");
    if (saved) setPatientSettings(JSON.parse(saved));
  }, []);

  const handleSavePatientSettings = (newSettings: PatientSettings) => {
    setPatientSettings(newSettings);
    localStorage.setItem("patientSettings", JSON.stringify(newSettings));
    setShowPatientModal(false);
  };

  const handleLogout = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-brand-gray-100 flex flex-col">
      {/* HEADER */}
      <header className="px-6 py-4 bg-white flex items-center shadow-sm border-b">
        <CogIcon className="w-6 h-6 mr-2 text-brand-green-600" />
        <h1 className="text-xl font-semibold text-brand-black">Ayarlar</h1>
      </header>

      <main className="flex-1 p-6 space-y-4">
        {settingsOptions.map(({ label, icon: Icon, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="w-full flex items-center space-x-4 p-4 bg-white hover:bg-gray-50 rounded-lg shadow-sm transition"
          >
            <Icon className="w-6 h-6 text-brand-green-500" />
            <span className="text-base font-medium text-brand-black">
              {label}
            </span>
          </button>
        ))}

        {/* Patient Settings Modal Trigger */}
        <button
          onClick={() => setShowPatientModal(true)}
          className="w-full flex items-center space-x-4 p-4 bg-white hover:bg-gray-50 rounded-lg shadow-sm transition"
        >
          <AdjustmentsHorizontalIcon className="w-6 h-6 text-brand-green-500" />
          <span className="text-base font-medium text-brand-black">
            Hasta Alanları
          </span>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-4 p-4 bg-white hover:bg-gray-50 rounded-lg shadow-sm transition text-red-600"
        >
          <ArrowRightOnRectangleIcon className="w-6 h-6 text-red-600" />
          <span className="text-base font-medium">Çıkış Yap</span>
        </button>
      </main>

      <NavigationBar />

      <PatientSettingsModal
        show={showPatientModal}
        initial={patientSettings}
        onClose={() => setShowPatientModal(false)}
        onSave={handleSavePatientSettings}
      />
    </div>
  );
};

export default SettingsPage;
