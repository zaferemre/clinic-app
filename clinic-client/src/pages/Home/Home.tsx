// src/pages/Home/Home.tsx

import React, { useState, useEffect } from "react";
import { CalendarPreview } from "../../components/CalendarPreview/CalendarPreview";
import { HomeNavGrid } from "../../components/HomeNavGrid/HomeNavGrid";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";
import { useAuth } from "../../context/AuthContext";
import { format } from "date-fns";
import { getNotifications, NotificationInfo } from "../../api/client";

const Home: React.FC = () => {
  const { idToken, clinicId, clinicName, user } = useAuth();
  const [todayStr, setTodayStr] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  // 1) Format today's date once
  useEffect(() => {
    const now = new Date();
    const formatted = format(now, "EEEE d MMMM").toUpperCase();
    setTodayStr(formatted);
  }, []);

  // 2) Fetch unread notifications count
  useEffect(() => {
    const fetchUnread = async () => {
      if (!idToken || !clinicId) {
        setUnreadCount(0);
        return;
      }
      try {
        const allNotifs: NotificationInfo[] = await getNotifications(
          idToken,
          clinicId
        );
        const cnt = allNotifs.filter((n) => !n.isCalled).length;
        setUnreadCount(cnt);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setUnreadCount(0);
      }
    };

    fetchUnread();
    // If you want live updates, you could poll or subscribe—this runs once on mount.
  }, [idToken, clinicId]);

  if (!idToken || !clinicId || !clinicName || !user) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-brand-gray-100 pb-16">
      <div className="flex-1 overflow-auto px-4 py-4 space-y-6">
        {/* 1) Welcome Header */}
        <div>
          <p className="text-xs text-brand-green-500 tracking-wide">
            {todayStr}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-brand-black">
            Hoş geldin, {user.name}!
          </h2>
          <p className="text-sm text-brand-gray-700 mt-1">
            Bugünün planını hemen aşağıdan görebilirsin.
          </p>
        </div>

        {/* 2) Navigation Grid (pass unreadCount) */}
        <HomeNavGrid unreadCount={unreadCount} />

        {/* 3) Calendar Preview Card */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-brand-black">
              Bugünün Randevuları
            </h3>
            {/* Optionally show count of today’s events if desired */}
          </div>
          <CalendarPreview
            onEventClick={(info) => {
              alert(`Randevu: ${info.event.title}`);
            }}
          />
        </div>
      </div>

      {/* 4) Bottom Navigation */}
      <NavigationBar />
    </div>
  );
};

export default Home;
