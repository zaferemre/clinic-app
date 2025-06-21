// src/pages/CalendarPage.tsx
import React from "react";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";
import { useAuth } from "../../contexts/AuthContext";
import CustomCalendar from "../../components/Calendar/CustomCalendar";
import { GreetingHeader } from "../../components/GreetingHeader/GreetingHeader";

const CalendarPage: React.FC = () => {
  const {
    idToken,
    selectedCompanyId,
    selectedCompanyName,
    selectedClinicId,
    selectedClinicName,
    user,
  } = useAuth();

  // Don't render until we have a token, company, clinic & user
  if (
    !idToken ||
    !selectedCompanyId ||
    !selectedCompanyName ||
    !selectedClinicId ||
    !selectedClinicName ||
    !user
  ) {
    return null;
  }

  return (
    <div
      className="flex flex-col h-screen pb-20
     bg-brand-gray-100 "
    >
      {/* Unified Page header */}
      <div className="px-4 pt-4 ">
        <GreetingHeader
          userName={user?.name || ""}
          userAvatarUrl={user?.imageUrl || ""}
          companyName={selectedCompanyName || ""}
          clinicName={selectedClinicName || ""}
          pageTitle="Takvim"
          showBackButton={true}
        />
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
