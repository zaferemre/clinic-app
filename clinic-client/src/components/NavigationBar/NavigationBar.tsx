import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  BellIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { getNotifications } from "../../api/notificationApi";

export const NavigationBar: React.FC = () => {
  const { companyName, idToken, companyId } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      if (!idToken || !companyId) return;
      try {
        const notifs = await getNotifications(idToken, companyId);
        setUnreadCount(notifs.filter((n) => !n.isCalled).length);
      } catch {
        setUnreadCount(0);
      }
    };
    fetchUnread();
  }, [idToken, companyId]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-t flex justify-around items-center h-16">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center text-xs ${
            isActive ? "text-green-600" : "text-gray-500"
          }`
        }
      >
        <HomeIcon className="h-6 w-6 mb-1" />
        Ana Sayfa
      </NavLink>

      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center text-xs ${
            isActive ? "text-green-600" : "text-gray-500"
          }`
        }
      >
        <BuildingOffice2Icon className="h-6 w-6 mb-1" />
        Panel
      </NavLink>

      <NavLink
        to="/calendar"
        className={({ isActive }) =>
          `flex flex-col items-center text-xs ${
            isActive ? "text-green-600" : "text-gray-500"
          }`
        }
      >
        <CalendarIcon className="h-6 w-6 mb-1" />
        Takvim
      </NavLink>

      <NavLink
        to="/notifications"
        className={({ isActive }) =>
          `relative flex flex-col items-center text-xs ${
            isActive ? "text-green-600" : "text-gray-500"
          }`
        }
      >
        {unreadCount > 0 && (
          <span className="absolute top-0 right-1 block h-2 w-2 rounded-full bg-red-500" />
        )}
        <BellIcon className="h-6 w-6 mb-1" />
        Çağrılar
      </NavLink>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex flex-col items-center text-xs ${
            isActive ? "text-green-600" : "text-gray-500"
          }`
        }
      >
        <Cog6ToothIcon className="h-6 w-6 mb-1" />
        Ayarlar
      </NavLink>
    </nav>
  );
};

export default NavigationBar;
