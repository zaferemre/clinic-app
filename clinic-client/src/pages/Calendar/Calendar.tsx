import React from "react";
import { CalendarView } from "../../components/CalendarView/CalendarView";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";
import { useAuth } from "../../contexts/AuthContext";

const CalendarPage: React.FC = () => {
  const { idToken, companyId, companyName, user } = useAuth();
  if (!idToken || !companyId || !companyName || !user) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen pb-16 bg-brand-gray-100">
      <div className="flex-1 overflow-auto">
        <CalendarView />
      </div>
      <NavigationBar />
    </div>
  );
};

export default CalendarPage;
