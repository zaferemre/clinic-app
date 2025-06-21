// src/pages/Dashboard/Dashboard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import DashboardHeader from "../../components/Dashboard/DashboardHeader";
import DashboardCardsGrid from "../../components/Dashboard/DashboardCardsGrid";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";
import {
  UsersIcon,
  UserGroupIcon,
  CalendarIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  BuildingStorefrontIcon,
  CogIcon,
  UserCircleIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useDashboardData } from "../../hooks/useDashboardData";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { selectedClinicId, user } = useAuth();
  const { patientCount, todayAppointments, unreadAlerts, services } =
    useDashboardData();

  const go = (path: string) => navigate(`/clinics/${selectedClinicId}${path}`);

  const cards = [
    {
      icon: <UsersIcon className="h-10 w-10 text-blue-500" />,
      label: "Müşteriler",
      colorClass: "text-blue-600",
      onClick: () => go("/patients"),
      countText: `${patientCount} kayıtlı`,
    },
    {
      icon: <UserGroupIcon className="h-10 w-10 text-pink-500" />,
      label: "Çalışanlar",
      colorClass: "text-pink-600",
      onClick: () => go("/employees"),
    },
    {
      icon: <BuildingStorefrontIcon className="h-10 w-10 text-purple-500" />,
      label: "Hizmetler",
      colorClass: "text-purple-600",
      onClick: () => go("/services"),
      countText: `${services.length} adet`,
    },
    {
      icon: <CalendarIcon className="h-10 w-10 text-yellow-500" />,
      label: "Takvim",
      colorClass: "text-yellow-600",
      onClick: () => go("/calendar"),
      countText: `${todayAppointments.length} bugün`,
    },
    {
      icon: <BellIcon className="h-10 w-10 text-red-500" />,
      label: "Bildirimler",
      colorClass: "text-red-600",
      onClick: () => go("/notifications"),
      showDot: unreadAlerts.length > 0,
    },
    {
      icon: <ChatBubbleLeftRightIcon className="h-10 w-10 text-green-500" />,
      label: "Mesajlar",
      colorClass: "text-green-600",
      onClick: () => go("/messaging"),
    },
    {
      icon: <CogIcon className="h-10 w-10 text-gray-600" />,
      label: "Ayarlar",
      colorClass: "text-gray-700",
      onClick: () => go("/settings"),
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-brand-gray-100 pb-16">
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <DashboardHeader />

        {/* Profile Card */}
        <button
          onClick={() => navigate(`/clinics/${selectedClinicId}/settings/user`)}
          className="
            w-full flex items-center p-4 bg-white rounded-2xl
            shadow-sm border border-gray-200 hover:shadow-md
            transition-shadow group
          "
        >
          <UserCircleIcon className="h-10 w-10 text-brand-main flex-shrink-0" />
          <div className="ml-4 flex-1 text-left">
            <div className="text-lg font-semibold text-gray-800">
              {user?.name}
            </div>
            <div className="text-sm text-gray-500">
              Profil ve hesap ayarları
            </div>
          </div>
          <ChevronRightIcon className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Dashboard Cards */}
        <DashboardCardsGrid cards={cards} />
      </div>

      <NavigationBar />
    </div>
  );
};

export default Dashboard;
