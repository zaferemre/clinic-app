// src/pages/Home/Home.tsx
import React, { useState, useEffect } from "react";
import { CalendarPreview } from "../../components/CalendarPreview/CalendarPreview";
import { HomeNavGrid } from "../../components/HomeNavGrid/HomeNavGrid";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";
import { useAuth } from "../../contexts/AuthContext";
import { format } from "date-fns";
import { getNotifications } from "../../api/notificationApi";
import { NotificationInfo } from "../../types/sharedTypes";
import { tr } from "date-fns/locale";

const Home: React.FC = () => {
  const { idToken, companyId, companyName, user } = useAuth();
  const [todayStr, setTodayStr] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const now = new Date();
    const formatted = format(now, "EEEE, d MMMM", { locale: tr });
    setTodayStr(formatted.charAt(0).toUpperCase() + formatted.slice(1));
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      if (!idToken || !companyId) return setUnreadCount(0);
      try {
        const allNotifs: NotificationInfo[] = await getNotifications(
          idToken,
          companyId
        );
        setUnreadCount(allNotifs.filter((n) => !n.isCalled).length);
      } catch {
        setUnreadCount(0);
      }
    };
    fetchUnread();
  }, [idToken, companyId]);

  if (!idToken || !companyId || !companyName || !user) return null;

  return (
    <div className="flex flex-col h-screen bg-gray-100 pb-16">
      <div className="flex-1 overflow-auto px-4 py-4 space-y-6">
        <div>
          <p className="text-xs text-green-600 tracking-wide">{todayStr}</p>
          <h2 className="mt-1 text-2xl font-bold text-gray-800">
            Hoş geldin, {user.name}!
          </h2>
        </div>

        <HomeNavGrid unreadCount={unreadCount} />

        <CalendarPreview
          onEventClick={() => {
            /* navigate to calendar */
          }}
        />
      </div>

      <NavigationBar />
    </div>
  );
};

export default Home;
