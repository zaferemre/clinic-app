import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import CreateCompanyButton from "../../components/Button/CreateCompanyButton/CreateCompanyButton";
import JoinCompanyButton from "../../components/Button/JoinCompanyButton/JoinCompanyButton";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";

const CompanyOnboardingPage: React.FC = () => {
  const { signOut, setCompanyId, setCompanyName } = useAuth();
  const navigate = useNavigate();

  const handleCreated = (id: string, name: string) => {
    setCompanyId(id);
    setCompanyName(name);
    navigate("/", { replace: true });
  };

  const handleJoined = (id: string, name: string) => {
    setCompanyId(id);
    setCompanyName(name);
    navigate("/", { replace: true });
  };

  return (
    <div className="relative min-h-screen w-full bg-white flex flex-col">
      {/* gradient glass background */}
      <div className="absolute inset-0 h-1/2 z-0 bg-[radial-gradient(circle_at_top,_rgba(0,200,150,0.6)_0%,_rgba(120,100,255,0.3)_50%,_white_90%)]" />

      {/* Logout */}
      <button
        onClick={() => {
          signOut();
          navigate("/login", { replace: true });
        }}
        className="
        absolute top-4 right-4 z-20 flex items-center gap-2
        px-4 py-2 bg-white/60 backdrop-blur
        text-brand-red-500 font-semibold rounded-2xl border border-white/30 shadow
        hover:bg-white/80 hover:text-red-600 transition
        active:scale-95
        text-base
      "
        title="Çıkış Yap"
      >
        <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
      </button>

      {/* Logo/brand */}
      <div className="relative mt-6 z-10 h-1/2 flex items-end justify-center pb-6">
        <span className="text-2xl font-bold text-white drop-shadow-lg tracking-wide select-none">
          randevy
        </span>
      </div>
      {/* Actions */}
      <div className="relative z-10 mt-auto px-6 pb-12 w-full">
        <div className="w-full max-w-2xl mx-auto flex flex-col md:flex-row gap-6">
          <CreateCompanyButton onCreated={handleCreated} />
          <JoinCompanyButton onJoined={handleJoined} />
        </div>
      </div>
    </div>
  );
};

export default CompanyOnboardingPage;
