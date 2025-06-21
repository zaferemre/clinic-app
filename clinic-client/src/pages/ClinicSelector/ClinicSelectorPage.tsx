// src/pages/ClinicSelector/ClinicSelectorPage.tsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getClinics } from "../../api/clinicApi";
import { Clinic } from "../../types/sharedTypes";
import ClinicSelectorHeader from "../../components/ClinicSelector/ClinicSelectorHeader";
import ClinicList from "../../components/ClinicSelector/ClinicList";
import EmptyClinics from "../../components/ClinicSelector/EmptyClinics";
import CompanySettingsButton from "../../components/ClinicSelector/CompanySettingsButton";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";

export function ClinicSelectorPage() {
  const navigate = useNavigate();
  const {
    idToken,
    selectedCompanyId,
    selectedCompanyName,
    clinics,
    setClinics,
    setSelectedClinicId,
    setSelectedClinicName,
    signOut,
    user,
    companies,
  } = useAuth();

  const company = companies?.find((c) => c._id === selectedCompanyId) || null;
  const isOwner =
    user &&
    company &&
    user.uid &&
    company.ownerUserId &&
    user.uid === company.ownerUserId;

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!idToken || !selectedCompanyId || fetchedRef.current) return;
    fetchedRef.current = true;
    getClinics(idToken, selectedCompanyId)
      .then((list: Clinic[]) => setClinics(list))
      .catch((err) => {
        console.error("getClinics error:", err);
        setClinics([]);
        fetchedRef.current = false;
      });
  }, [idToken, selectedCompanyId, setClinics]);

  // Navigation logic for clinic select/create
  const handleClinicSelect = (cl: Clinic) => {
    setSelectedClinicId(cl._id);
    setSelectedClinicName(cl.name);
    navigate(`/clinics/${cl._id}`, { replace: true });
  };
  const handleClinicCreated = async (newId: string) => {
    if (!idToken || !selectedCompanyId) return;
    const clinicsList = await getClinics(idToken, selectedCompanyId);
    setClinics(clinicsList);
    const newClinic = clinicsList.find((c) => c._id === newId);
    setSelectedClinicId(newId);
    setSelectedClinicName(newClinic?.name ?? "");
    navigate(`/clinics/${newId}`, { replace: true });
  };

  const noClinics = clinics.length === 0;

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-white">
      {/* Top Gradient */}
      <div className="absolute inset-0 h-1/2 z-0 bg-[radial-gradient(circle_at_top,_rgba(226,114,91,0.6)_0%,_rgba(184,108,255,0.24)_50%,_white_90%)]" />

      {/* Logout button */}
      <button
        onClick={() => {
          signOut();
          navigate("/login", { replace: true });
        }}
        className="absolute top-4 right-4 z-20 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur text-brand-main font-semibold rounded-2xl border border-white/30 shadow hover:bg-white/90 hover:text-red-600 transition active:scale-95 text-base"
        title="Çıkış Yap"
      >
        <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
      </button>

      {/* Centered Header */}
      <ClinicSelectorHeader companyName={selectedCompanyName} />

      {/* Main content */}
      <main className="relative z-10 mt-auto w-full px-6 pb-40 flex flex-col items-center">
        {noClinics ? (
          <EmptyClinics onCreated={handleClinicCreated} />
        ) : (
          <ClinicList
            clinics={clinics}
            onSelect={handleClinicSelect}
            onCreate={handleClinicCreated}
          />
        )}

        {isOwner && (
          <CompanySettingsButton
            onClick={() => navigate("/company-settings")}
          />
        )}
      </main>
    </div>
  );
}

export default ClinicSelectorPage;
