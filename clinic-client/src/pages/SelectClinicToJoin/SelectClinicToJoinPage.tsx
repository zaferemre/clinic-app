// src/pages/SelectClinicToJoinPage/SelectClinicToJoinPage.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { joinClinic } from "../../api/companyApi";
import { useAuth } from "../../contexts/AuthContext";
import { getClinics } from "../../api/clinicApi";
import ClinicPreviewCard from "../../components/Cards/ClinicPreviewCard";
import {
  ArrowLeftStartOnRectangleIcon,
  BuildingOffice2Icon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const InfoBox = () => (
  <div className="flex items-start bg-blue-50 border-l-4 border-blue-400 rounded-xl px-4 py-3 mb-6 shadow-sm max-w-2xl mx-auto">
    <InformationCircleIcon className="h-6 w-6 text-blue-400 mt-0.5 mr-2 shrink-0" />
    <div>
      <div className="text-blue-800 font-semibold mb-1">
        Klinik Seçimi Hakkında
      </div>
      <div className="text-blue-800 text-sm">
        <b>Her zaman aktif olarak yalnızca bir kliniğe bağlı olursunuz.</b>
        <br />
        İsterseniz daha sonra bulunduğunuz kliniği <b>
          ayarlardan ayrılabilir
        </b>{" "}
        ve başka bir kliniğe katılabilirsiniz.
      </div>
    </div>
  </div>
);

const SelectClinicToJoinPage: React.FC = () => {
  const {
    idToken,
    setSelectedCompanyId,
    setSelectedCompanyName,
    setClinics,
    setSelectedClinicId,
    setSelectedClinicName,
    signOut,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Safeguard for direct entry
  const { companyId, companyName, clinics } = (location.state || {}) as {
    companyId: string;
    companyName: string;
    clinics: { _id: string; name: string }[];
  };

  React.useEffect(() => {
    if (!companyId || !companyName) {
      navigate("/", { replace: true });
    }
  }, [companyId, companyName, navigate]);

  const handleJoinClinic = async (clinicId: string) => {
    if (!idToken) return;
    await joinClinic(idToken, companyId, clinicId);
    const clinicsList = await getClinics(idToken, companyId);
    setSelectedCompanyId(companyId);
    setSelectedCompanyName(companyName);
    setClinics(clinicsList);
    setSelectedClinicId(clinicId);
    const joinedClinic = clinicsList.find((c) => c._id === clinicId);
    setSelectedClinicName(joinedClinic?.name || "");
    navigate(`/clinics/${clinicId}`, { replace: true });
  };

  const noClinics = !clinics || clinics.length === 0;

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-white">
      {/* Gradient */}
      <div className="absolute inset-0 h-1/2 z-0 bg-[radial-gradient(circle_at_top,_rgba(226,114,91,0.6)_0%,_rgba(184,108,255,0.24)_50%,_white_90%)]" />

      {/* Logout */}
      <button
        onClick={() => {
          signOut?.();
          navigate("/login", { replace: true });
        }}
        className="absolute top-4 right-4 z-20 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur text-brand-main font-semibold rounded-2xl border border-white/30 shadow hover:bg-white/90 hover:text-red-600 transition active:scale-95 text-base"
        title="Çıkış Yap"
      >
        <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
      </button>

      {/* Centered brand/app header */}
      <div className="relative mt-10 z-10 flex flex-col items-center select-none">
        <span className="text-3xl md:text-4xl font-extrabold text-white drop-shadow tracking-wider">
          randevy
        </span>
        {companyName && (
          <span className="mt-1 text-xl md:text-2xl font-bold text-white/90 drop-shadow tracking-wide">
            {companyName}
          </span>
        )}
      </div>

      {/* Page info */}
      <div className="relative z-10 flex flex-col items-center mt-6 px-2 text-center">
        <h1 className="text-2xl font-bold text-brand-main mb-2">
          Kliniğe Katıl
        </h1>
        <div className="text-base text-brand-main/80 mb-4 max-w-lg">
          Şirketinizdeki bir kliniği seçin ve katılmak için üzerine tıklayın.
        </div>
      </div>

      {/* Info box */}
      <div className="relative z-10 w-full px-4 mb-2">
        <InfoBox />
      </div>

      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-4 pb-12">
        {/* Clinics grid or empty state */}
        {noClinics ? (
          <div className="flex flex-col items-center mt-12">
            <div className="rounded-full bg-brand-main/10 p-6 mb-4">
              <BuildingOffice2Icon className="w-14 h-14 text-brand-main" />
            </div>
            <div className="text-xl font-semibold text-brand-main mb-1">
              Şirkete bağlı klinik bulunamadı.
            </div>
            <div className="text-gray-500 mb-7 text-center max-w-xs">
              Lütfen yöneticinize danışın veya daha sonra tekrar deneyin.
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-5">
            {clinics.map((cl) => (
              <div
                key={cl._id}
                className="rounded-2xl shadow bg-white/90 hover:shadow-xl transition-shadow duration-200 cursor-pointer"
                onClick={() => handleJoinClinic(cl._id)}
              >
                <ClinicPreviewCard
                  clinic={{
                    ...cl,
                    // Fill with sensible defaults if needed for preview
                    companyId,
                    workingHours: [],
                    services: [],
                    employees: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  }}
                  onSelect={() => handleJoinClinic(cl._id)}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SelectClinicToJoinPage;
