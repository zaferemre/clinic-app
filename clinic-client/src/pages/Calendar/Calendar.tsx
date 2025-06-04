// src/pages/Calendar.tsx
import React from "react";
import { Header } from "../../components/Header/Header";
import { CalendarView } from "../../components/CalendarView/CalendarView";
import { Footer } from "../../components/Footer/Footer";
import { useAuth } from "../../context/AuthContext";

const CalendarPage: React.FC = () => {
  const { idToken, clinicId, clinicName, user, signOut } = useAuth();
  if (!idToken || !clinicId || !clinicName || !user) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen pb-16 bg-brand-gray-100">
      <div className="flex-1 overflow-auto ">
        {/* This is your full‐size calendar component */}
        <CalendarView idToken={idToken} clinicId={clinicId} />
      </div>
      <Footer />
    </div>
  );
};

export default CalendarPage;
