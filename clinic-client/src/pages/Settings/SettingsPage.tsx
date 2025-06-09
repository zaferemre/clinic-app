import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CogIcon,
  UserIcon,
  BuildingStorefrontIcon,
  BellIcon,
  SunIcon,
  LockClosedIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";

const settingsOptions = [
  { label: "Profil", icon: UserIcon, path: "/settings/profile" },
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

export const SettingsPage: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

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

      {/* OPTIONS LIST */}
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
    </div>
  );
};

export default SettingsPage;
