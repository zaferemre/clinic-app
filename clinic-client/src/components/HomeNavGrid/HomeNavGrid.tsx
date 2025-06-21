import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  UsersIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

interface NavCard {
  label: string;
  icon: React.ReactNode;
  route: string;
}

interface HomeNavGridProps {
  unreadCount: number;
}

export const HomeNavGrid: React.FC<HomeNavGridProps> = ({ unreadCount }) => {
  const navigate = useNavigate();
  const { selectedClinicId } = useAuth();

  const cards: NavCard[] = [
    {
      label: "Müşteriler",
      icon: <UsersIcon className="h-7 w-7" />,
      route: `/clinics/${selectedClinicId}/patients`,
    },
    {
      label: "Panel",
      icon: <BuildingOffice2Icon className="h-7 w-7" />,
      route: `/clinics/${selectedClinicId}/dashboard`,
    },
    {
      label: "Takvim",
      icon: <CalendarIcon className="h-7 w-7" />,
      route: `/clinics/${selectedClinicId}/calendar`,
    },
    {
      label: "Bildirimler",
      icon: <BellIcon className="h-7 w-7" />,
      route: `/clinics/${selectedClinicId}/notifications`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <button
          key={card.label}
          onClick={() => navigate(card.route)}
          className={`
            group relative bg-white
            rounded-2xl shadow-md
            p-4
            flex flex-col items-center justify-center
            transition-all duration-150
            hover:shadow-lg hover:scale-[1.04]
            active:scale-95
            focus:outline-none focus:ring-2 focus:ring-brand-main-100
          `}
        >
          {/* Notification badge */}
          {card.label === "Bildirimler" && unreadCount > 0 && (
            <span className="absolute top-3 right-3 h-3 w-3 rounded-full bg-brand-main-500 ring-2 ring-white shadow" />
          )}
          <div
            className={`
              flex items-center justify-center 
             text-black
              rounded-full
              h-12 w-12
             
              group-hover:ring-2 group-hover:ring-brand-main-100
              transition
            `}
          >
            {card.icon}
          </div>
          <span className="text-base font-semibold text-black">
            {card.label}
          </span>
        </button>
      ))}
    </div>
  );
};
