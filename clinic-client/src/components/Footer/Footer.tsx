// src/components/Footer.tsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  BellIcon,
  EllipsisVerticalIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";

export const Footer: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const openMenu = () => setMenuOpen(true);

  return (
    <>
      {/* — Fixed Bottom Bar — */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-brand-gray-200 h-14 flex items-center justify-between px-6 z-20">
        {/* Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive
              ? "text-brand-green-500"
              : "text-brand-gray-500 hover:text-brand-green-500"
          }
        >
          <HomeIcon className="h-6 w-6" />
        </NavLink>

        {/* Patients */}
        <NavLink
          to="/patients"
          className={({ isActive }) =>
            isActive
              ? "text-brand-green-500"
              : "text-brand-gray-500 hover:text-brand-green-500"
          }
        >
          <UsersIcon className="h-6 w-6" />
        </NavLink>

        {/* Center Menu Button */}
        <button
          onClick={openMenu}
          className="relative -mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand-green-500 shadow-lg hover:scale-105 transform transition"
        >
          <EllipsisVerticalIcon className="h-6 w-6 text-white" />
        </button>

        {/* Calendar */}
        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            isActive
              ? "text-brand-green-500"
              : "text-brand-gray-500 hover:text-brand-green-500"
          }
        >
          <CalendarIcon className="h-6 w-6" />
        </NavLink>

        {/* Notifications */}
        <button
          onClick={() => {
            // Placeholder for future notifications
          }}
          className="text-brand-gray-500 hover:text-brand-green-500"
        >
          <BellIcon className="h-6 w-6" />
        </button>
      </footer>

      {/* — Bottom‐Sheet Menu Overlay — */}
      {menuOpen && (
        <>
          {/* Backdrop with fadeIn */}
          <div
            className="fixed inset-0 bg-black/50 z-30 animate-fadeIn"
            onClick={closeMenu}
          />

          {/* Sliding Panel (slideUp) */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-tp h-2/3 z-40 flex flex-col animate-slideUp">
            {/* Close Button */}
            <div className="w-full flex justify-end p-2">
              <button
                onClick={closeMenu}
                className="text-brand-gray-500 hover:text-brand-black focus:outline-none"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-auto px-6 py-4 space-y-4 text-base">
              <NavLink
                to="/"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block w-full py-2 rounded-md ${
                    isActive
                      ? "bg-brand-gray-100 text-brand-black"
                      : "text-brand-gray-700 hover:bg-brand-gray-50 hover:text-brand-black"
                  }`
                }
              >
                Ana Sayfa
              </NavLink>
              <NavLink
                to="/calendar"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block w-full py-2 rounded-md ${
                    isActive
                      ? "bg-brand-gray-100 text-brand-black"
                      : "text-brand-gray-700 hover:bg-brand-gray-50 hover:text-brand-black"
                  }`
                }
              >
                Takvim
              </NavLink>
              <NavLink
                to="/patients"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block w-full py-2 rounded-md ${
                    isActive
                      ? "bg-brand-gray-100 text-brand-black"
                      : "text-brand-gray-700 hover:bg-brand-gray-50 hover:text-brand-black"
                  }`
                }
              >
                Hastalar
              </NavLink>
              <button
                onClick={() => {
                  closeMenu();
                  signOut();
                  navigate("/login", { replace: true });
                }}
                className="w-full text-left py-2 rounded-md text-error hover:bg-error/10"
              >
                Çıkış Yap
              </button>
            </nav>
          </div>
        </>
      )}
    </>
  );
};
