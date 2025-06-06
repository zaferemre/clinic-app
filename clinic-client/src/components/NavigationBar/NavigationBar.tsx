// src/components/NavigationBar.tsx

import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  BellIcon,
  EllipsisVerticalIcon,
  BuildingOffice2Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { getNotifications } from "../../api/client";

// Define a local type matching the shape returned by getNotifications
interface NotificationInfo {
  isCalled?: boolean;
  // Add other properties if needed, e.g. id, patientName, createdAt, etc.
}

export const NavigationBar: React.FC = () => {
  const { signOut, clinicName, idToken, clinicId } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        if (!idToken || !clinicId) {
          setUnreadCount(0);
          return;
        }
        // getNotifications returns an array of objects that include at least `isCalled`.
        const allNotifs = (await getNotifications(
          idToken,
          clinicId
        )) as NotificationInfo[];
        const count = allNotifs.filter((n) => !n.isCalled).length;
        setUnreadCount(count);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setUnreadCount(0);
      }
    };

    fetchUnread();
  }, [idToken, clinicId]);
  return (
    <>
      {/* — Pill-shaped bottom “mini-nav” container — */}
      <nav
        className="
          fixed bottom-4 left-1/2 transform -translate-x-1/2
          bg-white rounded-full shadow-lg
          px-8 py-2
          flex justify-between items-center
          w-[90%] max-w-md
          z-50
        "
      >
        {/* Home Icon */}
        <NavLink
          to="/"
          className="relative flex flex-col items-center text-brand-gray-400 hover:text-brand-gray-600"
        >
          {({ isActive }) => (
            <>
              <HomeIcon
                className={`h-6 w-6 ${isActive ? "text-brand-green-500" : ""}`}
              />
              <span className="text-xs mt-1">Home</span>
              {isActive && (
                <span className="absolute bottom-[-6px] h-1 w-4 rounded-full bg-brand-green-500" />
              )}
            </>
          )}
        </NavLink>

        {/* Clinic Home (uses clinicName) */}
        <NavLink
          to="/dashboard"
          className="relative flex flex-col items-center text-brand-gray-400 hover:text-brand-gray-600"
        >
          {({ isActive }) => (
            <>
              <BuildingOffice2Icon
                className={`h-6 w-6 ${isActive ? "text-brand-green-500" : ""}`}
              />
              <span className="text-xs mt-1 truncate max-w-[4rem]">
                {clinicName ?? "Clinic"}
              </span>
              {isActive && (
                <span className="absolute bottom-[-6px] h-1 w-4 rounded-full bg-brand-green-500" />
              )}
            </>
          )}
        </NavLink>

        {/* Center Menu Button */}
        <button
          onClick={openMenu}
          className="
            relative -mt-6
            flex h-12 w-12 items-center justify-center
            rounded-full bg-brand-green-500 shadow-lg
            hover:scale-105 transform transition
            text-white
          "
        >
          <EllipsisVerticalIcon className="h-6 w-6" />
        </button>

        {/* Calendar Icon */}
        <NavLink
          to="/calendar"
          className="relative flex flex-col items-center text-brand-gray-400 hover:text-brand-gray-600"
        >
          {({ isActive }) => (
            <>
              <CalendarIcon
                className={`h-6 w-6 ${isActive ? "text-brand-green-500" : ""}`}
              />
              <span className="text-xs mt-1">Calendar</span>
              {isActive && (
                <span className="absolute bottom-[-6px] h-1 w-4 rounded-full bg-brand-green-500" />
              )}
            </>
          )}
        </NavLink>

        {/* Notifications Icon (with red dot if unreadCount > 0) */}
        <NavLink
          to="/notifications"
          className="relative flex flex-col items-center text-brand-gray-400 hover:text-brand-gray-600"
        >
          {({ isActive }) => (
            <>
              <BellIcon
                className={`h-6 w-6 ${isActive ? "text-brand-green-500" : ""}`}
              />
              <span className="text-xs mt-1">Alerts</span>
              {isActive && (
                <span className="absolute bottom-[-6px] h-1 w-4 rounded-full bg-brand-green-500" />
              )}
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-error ring-1 ring-white" />
              )}
            </>
          )}
        </NavLink>
      </nav>

      {/* — Bottom-Sheet Overlay (Full Navigation) — */}
      {menuOpen && (
        <>
          {/* Semi-transparent backdrop */}
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMenu}
            className="fixed inset-0 bg-black/50 z-40"
            tabIndex={0}
            style={{ all: "unset", cursor: "pointer" }}
          />

          {/* Sliding up panel */}
          <div
            className="
              fixed bottom-0 left-0 right-0
              bg-white rounded-t-xl shadow-md
              h-2/3 z-50
              flex flex-col
              animate-slideUp
            "
          >
            {/* Close Button */}
            <div className="w-full flex justify-end p-2">
              <button
                onClick={closeMenu}
                className="text-brand-gray-500 hover:text-brand-black focus:outline-none"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Full Nav Links */}
            <nav className="flex-1 overflow-auto px-6 py-4 space-y-4 text-base">
              <NavLink
                to="/"
                onClick={closeMenu}
                className="flex items-center space-x-3 w-full py-2 rounded-md text-brand-gray-700 hover:bg-brand-gray-50 hover:text-brand-black"
              >
                <HomeIcon className="h-5 w-5" />
                <span>Ana Sayfa</span>
              </NavLink>

              <NavLink
                to="/dashboard"
                onClick={closeMenu}
                className="flex items-center space-x-3 w-full py-2 rounded-md text-brand-gray-700 hover:bg-brand-gray-50 hover:text-brand-black"
              >
                <UsersIcon className="h-5 w-5" />
                <span>{clinicName ?? "Clinic Home"}</span>
              </NavLink>

              <NavLink
                to="/calendar"
                onClick={closeMenu}
                className="flex items-center space-x-3 w-full py-2 rounded-md text-brand-gray-700 hover:bg-brand-gray-50 hover:text-brand-black"
              >
                <CalendarIcon className="h-5 w-5" />
                <span>Takvim</span>
              </NavLink>

              <NavLink
                to="/patients"
                onClick={closeMenu}
                className="flex items-center space-x-3 w-full py-2 rounded-md text-brand-gray-700 hover:bg-brand-gray-50 hover:text-brand-black"
              >
                <UsersIcon className="h-5 w-5" />
                <span>Hastalar</span>
              </NavLink>

              <NavLink
                to="/workers"
                onClick={closeMenu}
                className="flex items-center space-x-3 w-full py-2 rounded-md text-brand-gray-700 hover:bg-brand-gray-50 hover:text-brand-black"
              >
                <BuildingOffice2Icon className="h-5 w-5" />
                <span>Çalışanlar</span>
              </NavLink>

              <NavLink
                to="/notifications"
                onClick={closeMenu}
                className="flex items-center space-x-3 w-full py-2 rounded-md text-brand-gray-700 hover:bg-brand-gray-50 hover:text-brand-black"
              >
                <BellIcon className="h-5 w-5" />
                <span>Çağrılar</span>
                {unreadCount > 0 && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-error ring-1 ring-white" />
                )}
              </NavLink>

              <button
                onClick={() => {
                  closeMenu();
                  signOut();
                  navigate("/login", { replace: true });
                }}
                className="w-full flex items-center space-x-3 text-error py-2 rounded-md hover:bg-error/10"
              >
                <XMarkIcon className="h-5 w-5" />
                <span>Çıkış Yap</span>
              </button>
            </nav>
          </div>
        </>
      )}
    </>
  );
};
