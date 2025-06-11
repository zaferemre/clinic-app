// src/components/HomeNavGrid/HomeNavGrid.tsx
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
  bgColor?: string;
  textColor?: string;
}

/**
 * Props:
 *   unreadCount: number of unread notifications
 */
interface HomeNavGridProps {
  unreadCount: number;
}

export const HomeNavGrid: React.FC<HomeNavGridProps> = ({ unreadCount }) => {
  const navigate = useNavigate();

  // Define the four cards; the Alerts card will show a dot if unreadCount > 0
  const cards: NavCard[] = [
    {
      label: "Patients",
      icon: <UsersIcon className="h-8 w-8" />,
      route: "/patients",
      bgColor: "bg-brand-blue-100",
      textColor: "text-brand-blue-500",
    },
    {
      label: "Employees",
      icon: <BuildingOffice2Icon className="h-8 w-8" />,
      route: "/employees",
      bgColor: "bg-brand-pink-100",
      textColor: "text-brand-pink-500",
    },
    {
      label: "Calendar",
      icon: <CalendarIcon className="h-8 w-8" />,
      route: "/calendar",
      bgColor: "bg-brand-orange-100",
      textColor: "text-brand-orange-500",
    },
    {
      label: "Alerts",
      icon: <BellIcon className="h-8 w-8" />,
      route: "/notifications",
      bgColor: "bg-brand-red-100",
      textColor: "text-brand-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {cards.map((card) => (
        <button
          key={card.label}
          onClick={() => navigate(card.route)}
          className={`
            relative
            ${card.bgColor || "bg-white"}
            rounded-xl shadow-lg
            aspect-square
            flex flex-col items-center justify-center
            hover:shadow-xl transition
          `}
        >
          {/* If this is the “Alerts” card and there are unread items, show a small red dot */}
          {card.label === "Alerts" && unreadCount > 0 && (
            <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-1 ring-white" />
          )}

          <div className={`${card.textColor || "text-brand-green-400"}`}>
            {card.icon}
          </div>
          <span
            className={`mt-2 text-sm font-medium ${
              card.textColor || "text-brand-black"
            }`}
          >
            {card.label}
          </span>
        </button>
      ))}
    </div>
  );
};
