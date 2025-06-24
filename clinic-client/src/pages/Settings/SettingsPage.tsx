// src/pages/Settings/SettingsPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircleIcon,
  Cog8ToothIcon,
  BuildingLibraryIcon,
  UserGroupIcon,
  BellAlertIcon,
  EyeIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";
import { PatientSettingsModal } from "../../components/Modals/PatientSettingsModal";
import { PatientSettings } from "../../types/sharedTypes";
import GreetingHeader from "../../components/GreetingHeader/GreetingHeader";
import { getPrimaryRole, isElevatedRole } from "../../utils/userRole";

const DEFAULT_PATIENT_SETTINGS: PatientSettings = {
  showCredit: true,
  showPaymentStatus: true,
  showServicesReceived: true,
  showServicePointBalance: true,
  showNotes: false,
};

const SettingsPage: React.FC = () => {
  const {
    signOut,
    selectedCompanyId,
    selectedClinicId,
    selectedClinicName,
    user,
  } = useAuth();
  const navigate = useNavigate();
  const base = `/clinics/${selectedClinicId}/settings`;

  // Compute current role for this company/clinic context
  const userRole = getPrimaryRole(user, selectedCompanyId, selectedClinicId);

  // Settings options based on role
  const settingsOptions = [
    { label: "Profil", icon: UserCircleIcon, path: `${base}/user` },
    ...(userRole === "owner"
      ? [
          {
            label: "Şirket Ayarları",
            icon: Cog8ToothIcon,
            path: "/company-settings",
          },
        ]
      : []),
    ...(isElevatedRole(userRole)
      ? [
          {
            label: "Klinik Ayarları",
            icon: BuildingLibraryIcon,
            path: `${base}/clinic`,
          },
          {
            label: "Roller",
            icon: UserGroupIcon,
            path: `${base}/roles`,
          },
        ]
      : []),
    {
      label: "Bildirim Ayarları",
      icon: BellAlertIcon,
      path: `${base}/notifications`,
    },
    { label: "Görünüm", icon: EyeIcon, path: `${base}/appearance` },
    { label: "Güvenlik", icon: ShieldCheckIcon, path: `${base}/security` },
  ];

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

  // Safe logout handler
  const handleLogout = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-brand-gray-100 flex flex-col pb-16">
      <div className="px-4 pt-4 bg-transparent">
        <GreetingHeader
          userAvatarUrl={user?.photoUrl ?? ""}
          clinicName={selectedClinicName ?? ""}
          pageTitle="Ayarlar"
          showBackButton={true}
        />
      </div>

      <main className="flex-1 px-6 pb-16 space-y-4">
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

        <button
          onClick={() => setShowPatientModal(true)}
          className="w-full flex items-center space-x-4 p-4 bg-white hover:bg-gray-50 rounded-lg shadow-sm transition"
        >
          <AdjustmentsHorizontalIcon className="w-6 h-6 text-brand-green-500" />
          <span className="text-base font-medium text-brand-black">
            Hasta Alanları
          </span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-4 p-4 bg-white hover:bg-gray-50 rounded-lg shadow-sm transition text-red-600"
        >
          <ArrowRightStartOnRectangleIcon className="w-6 h-6 text-red-600" />
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
