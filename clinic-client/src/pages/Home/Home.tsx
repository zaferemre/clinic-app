// src/pages/Home.tsx
import React from "react";

import { Footer } from "../../components/Footer/Footer";
import { useAuth } from "../../context/AuthContext";
import { CalendarPreview } from "../../components/CalendarPreview/CalendarPreview";
const Home: React.FC = () => {
  const { idToken, clinicId, clinicName, user } = useAuth();
  if (!idToken || !clinicId || !clinicName || !user) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen pb-16 bg-brand-gray-100">
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* A small greeting or stats could go here */}
        <div>
          <h2 className="text-xl font-semibold text-brand-black">
            Hoş geldin, {user.name}!
          </h2>
          <p className="text-sm text-brand-gray-700">
            Bugünün planını hemen aşağıdan görebilirsin.
          </p>
        </div>

        {/* Calendar Preview */}
        <CalendarPreview
          idToken={idToken}
          clinicId={clinicId}
          onEventClick={(info) => {
            // e.g. open a modal with event details
            alert(`Randevu: ${info.event.title}`);
          }}
        />

        {/* You can add more “Home” components here, e.g. quick patient stats */}
      </div>

      <Footer />
    </div>
  );
};

export default Home;
