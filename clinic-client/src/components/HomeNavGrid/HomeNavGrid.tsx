import React from "react";
import { useNavigate } from "react-router-dom";
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
  bg: string;
  text: string;
}

interface HomeNavGridProps {
  unreadCount: number;
}

export const HomeNavGrid: React.FC<HomeNavGridProps> = ({ unreadCount }) => {
  const navigate = useNavigate();

  const cards: NavCard[] = [
    {
      label: "Hastalar",
      icon: <UsersIcon className="h-8 w-8" />,
      route: "/patients",
      bg: "bg-brand-green/20",
      text: "text-green-600",
    },
    {
      label: "Panel",
      icon: <BuildingOffice2Icon className="h-8 w-8" />,
      route: "/dashboard",
      bg: "bg-brand-yellow/20",
      text: "text-brand-main",
    },
    {
      label: "Takvim",
      icon: <CalendarIcon className="h-8 w-8" />,
      route: "/calendar",
      bg: "bg-brand-fuchsia/20",
      text: "text-brand-fuchsia",
    },
    {
      label: "Bildirimler",
      icon: <BellIcon className="h-8 w-8" />,
      route: "/notifications",
      bg: "bg-brand-red/20",
      text: "text-brand-red",
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 p-2">
      {cards.map((card) => (
        <button
          key={card.label}
          onClick={() => navigate(card.route)}
          className={`
            relative
            ${card.bg}
            rounded-xl shadow
            aspect-square
            flex flex-col items-center justify-center
            hover:bg-brand-main/20 active:bg-brand-main/30 transition
            focus:outline-none
          `}
        >
          {/* Show a red dot for unread notifications */}
          {card.label === "Bildirimler" && unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          )}
          <div className={`${card.text}`}>{card.icon}</div>
          <span className={`mt-2 text-base font-semibold ${card.text}`}>
            {card.label}
          </span>
        </button>
      ))}
    </div>
  );
};
