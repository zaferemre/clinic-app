// src/pages/CalendarPage.tsx
import React, { useEffect, useState } from "react";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";
import { useAuth } from "../../contexts/AuthContext";
import { CustomCalendar } from "../../components/Calendar/CustomCalendar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const CalendarPage: React.FC = () => {
  const { idToken, companyId, companyName, user } = useAuth();
  const [todayStr, setTodayStr] = useState("");

  // Format today's date in Turkish, capitalized
  useEffect(() => {
    const now = new Date();
    const formatted = format(now, "EEEE, d MMMM yyyy", { locale: tr });
    setTodayStr(formatted.charAt(0).toUpperCase() + formatted.slice(1));
  }, []);

  if (!idToken || !companyId || !companyName || !user) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen pb-16 bg-brand-gray-100">
      {/* Page header */}
      <div className="px-4 py-4 bg-white shadow flex flex-col">
        <h1 className="text-2xl font-bold text-brand-main">Takvim</h1>
        <span className="text-sm text-gray-600">{todayStr}</span>
      </div>

      {/* Calendar itself */}
      <div className="flex-1 overflow-auto">
        <CustomCalendar />
      </div>

      <NavigationBar />
    </div>
  );
};

export default CalendarPage;
