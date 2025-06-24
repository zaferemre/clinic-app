import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import CreateCompanyButton from "../../components/Button/CreateCompanyButton/CreateCompanyButton";
import JoinCompanyButton from "../../components/Button/JoinCompanyButton/JoinCompanyButton";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";

const CompanyOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, companies } = useAuth();

  // Optional: auto-redirect if user already has company
  React.useEffect(() => {
    if (companies && companies.length > 0) {
      navigate("/clinics", { replace: true });
    }
  }, [companies, navigate]);

  const handleLogout = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  const handleCompanySuccess = () => {
    navigate("/clinics", { replace: true });
  };

  return (
    <div className="relative min-h-screen w-full bg-white flex flex-col">
      {/* Gradient glass background */}
      <div className="absolute inset-0 h-[48%] z-0 bg-[radial-gradient(circle_at_top,_rgba(226,114,91,0.62)_0%,_rgba(184,108,255,0.23)_50%,_white_100%)]" />

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="
          absolute top-4 right-4 z-20 flex items-center gap-2
          px-4 py-2 bg-white/60 backdrop-blur
          text-brand-main font-semibold rounded-2xl border border-white/30 shadow
          hover:bg-white/80 hover:text-red-600 transition
          active:scale-95
          text-base
        "
        title="Çıkış Yap"
      >
        <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
      </button>

      {/* App name */}
      <div className="relative z-10 w-full flex flex-col items-center pt-16 pb-2 select-none">
        <span className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg tracking-wide">
          randevy
        </span>
      </div>

      {/* Info */}
      <div className="relative z-10 w-full flex flex-col items-center pt-2 pb-2">
        <span className="text-md text-gray-700">
          Bir şirkete katıl veya yeni bir şirket oluştur!
        </span>
      </div>

      {/* Actions */}
      <div className="relative z-10 mt-auto px-6 pb-12 w-full">
        <div className="w-full max-w-xl mx-auto flex flex-col gap-8">
          <CreateCompanyButton onCreated={handleCompanySuccess} />
          <JoinCompanyButton onJoined={handleCompanySuccess} />
        </div>
      </div>
    </div>
  );
};

export default CompanyOnboardingPage;
