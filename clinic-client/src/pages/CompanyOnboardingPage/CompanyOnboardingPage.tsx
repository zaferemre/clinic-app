import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import CreateCompanyButton from "../../components/Button/CreateCompanyButton/CreateCompanyButton";
import JoinCompanyButton from "../../components/Button/JoinCompanyButton/JoinCompanyButton";

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
      <div className="absolute inset-0 h-1/2 z-0 bg-[radial-gradient(circle_at_top,_rgba(0,200,150,0.6)_0%,_rgba(120,100,255,0.3)_50%,_white_90%)]" />
      <button
        onClick={() => {
          signOut();
          navigate("/login", { replace: true });
        }}
        className="absolute top-4 right-4 z-20 px-6 py-2 bg-brand-red-300 hover:bg-brand-red-500 text-white font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-brand-green-200 transition-colors duration-200 drop-shadow-md"
      >
        Çıkış Yap
      </button>
      <div className="relative mt-6 z-10 h-1/2 flex items-end justify-center pb-6">
        <span className="text-xl font-semibold text-white drop-shadow-md">
          randevi
        </span>
      </div>
      {/* Bottom row: company actions */}
      <div className="relative z-10 mt-auto px-6 pb-10 w-full">
        <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-6">
          <CreateCompanyButton onCreated={handleCreated} />
          <JoinCompanyButton onJoined={handleJoined} />
        </div>
      </div>
    </div>
  );
};

export default CompanyOnboardingPage;
