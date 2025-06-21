// src/components/NavigationBar/NavBarNavLink.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

const icons = {
  home: HomeIcon,
  dashboard: BuildingOffice2Icon,
  calendar: CalendarIcon,
  notifications: BellIcon,
  // You can add more as needed
};

interface Props {
  to: string;
  icon: keyof typeof icons;
  label: string;
  badge?: React.ReactNode;
}

const NavBarNavLink: React.FC<Props> = ({ to, icon, label, badge }) => {
  const Icon = icons[icon];
  return (
    <NavLink to={to} end className="flex-1 mx-[2px] relative">
      {({ isActive }) => (
        <div
          className={`flex items-center justify-center h-11 rounded-full px-2 ${
            isActive ? "bg-brand-main text-white font-bold" : "text-brand-main"
          } transition`}
        >
          <Icon className="h-6 w-6" />
          {isActive && (
            <span className="ml-2 text-base hidden sm:inline">{label}</span>
          )}
          {badge}
        </div>
      )}
    </NavLink>
  );
};

export default NavBarNavLink;
