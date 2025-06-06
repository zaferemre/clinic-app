// src/pages/NewUserPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import CreateClinicForm from "../../components/UserOnboarding/CreateClinicForm";
import { JoinClinicForm } from "../../components/UserOnboarding/JoinClinicForm";

const NewUserPage: React.FC = () => {
  const { signOut, setClinicId, setClinicName } = useAuth();
  const navigate = useNavigate();

  // Called after successfully creating a brand-new clinic
  const handleCreated = (clinicId: string, clinicName: string) => {
    setClinicId(clinicId);
    setClinicName(clinicName);
    navigate("/", { replace: true });
  };

  // Called after successfully joining an existing clinic
  const handleJoined = (clinicId: string, clinicName: string) => {
    setClinicId(clinicId);
    setClinicName(clinicName);
    console.log(`Joined clinic: ${clinicName} (ID: ${clinicId})`);
    navigate("/", { replace: true });
  };

  const handleLogout = () => {
    signOut();
    // After sign‐out, send the user back to /login (or wherever you want)
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative min-h-screen w-full bg-white flex flex-col">
      {/* Top Half Gradient */}
      <div className="absolute inset-0 h-1/2 z-0 bg-[radial-gradient(circle_at_top,_rgba(0,200,150,0.6)_0%,_rgba(120,100,255,0.3)_50%,_white_90%)]" />

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="
          absolute top-4 right-4 z-20
         px-6 py-2 bg-brand-red-300 hover:bg-brand-red-500 text-white font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-brand-green-200 transition-colors duration-200 drop-shadow-md
        "
      >
        Çıkış Yap
      </button>

      {/* Brand / Logo */}
      <div className="relative mt-6 z-10 h-1/2 flex items-end justify-center pb-6">
        <span className="text-xl font-semibold text-white drop-shadow-md">
          clinica
        </span>
      </div>

      {/* Forms Section pushed to bottom */}
      <div className="relative z-10 mt-auto px-6 pb-10 w-full">
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <CreateClinicForm onCreated={handleCreated} />
          <JoinClinicForm onJoined={handleJoined} />
        </div>
      </div>
    </div>
  );
};

export default NewUserPage;
