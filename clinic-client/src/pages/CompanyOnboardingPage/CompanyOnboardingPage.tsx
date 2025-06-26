import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import CreateCompanyButton from "../../components/Button/CreateCompanyButton/CreateCompanyButton";
import JoinCompanyButton from "../../components/Button/JoinCompanyButton/JoinCompanyButton";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";

const MAIN_BG =
  "linear-gradient(135deg, #ffe1da 0%, #fdf3ef 45%, #fff7f4 100%)";

const CompanyOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, companies, refreshUserContext } = useAuth();

  React.useEffect(() => {
    if (companies && companies.length > 0) {
      navigate("/clinics", { replace: true });
    }
  }, [companies, navigate]);

  const handleLogout = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  const handleCompanySuccess = async () => {
    await refreshUserContext();
    navigate("/clinics", { replace: true });
  };

  return (
    <div
      className="relative min-h-screen w-full flex flex-col"
      style={{ background: MAIN_BG, fontFamily: "'Inter', sans-serif" }}
    >
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="
          absolute top-4 right-4 z-20 flex items-center gap-2
          px-4 py-2 bg-white/60 backdrop-blur
          text-[#e2725b] font-semibold rounded-2xl border border-white/30 shadow
          hover:bg-white/80 hover:text-red-600 transition
          active:scale-95
          text-base
        "
        title="Çıkış Yap"
      >
        <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
        Çıkış
      </button>

      {/* HEADER at the very top */}
      <div className="w-full flex flex-col items-center pt-14 pb-2 select-none">
        <img
          src="/randevi-small.png"
          alt="randevi logo"
          className="h-14 rounded-lg mb-2"
        />

        <p className="text-base text-gray-700 mb-1 font-medium">
          Bir şirkete katıl veya yeni bir şirket oluştur!
        </p>
      </div>

      {/* Spacer to push buttons to the bottom */}
      <div className="flex-1" />

      {/* ACTION BUTTONS at the bottom */}
      <div className="w-full max-w-[380px] mx-auto flex flex-col gap-5 mb-16 px-4">
        <CreateCompanyButton onCreated={handleCompanySuccess} />
        <JoinCompanyButton onJoined={handleCompanySuccess} />
      </div>

      {/* Footer */}
      <div className="absolute bottom-2 left-0 w-full text-center text-xs text-gray-400 pointer-events-none select-none z-0">
        © {new Date().getFullYear()} randevi
      </div>
    </div>
  );
};

export default CompanyOnboardingPage;
