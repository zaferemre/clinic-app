import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getClinics } from "../../api/clinicApi";
import { Clinic } from "../../types/sharedTypes";
import ClinicSelectorHeader from "../../components/ClinicSelector/ClinicSelectorHeader";
import ClinicList from "../../components/ClinicSelector/ClinicList";
import EmptyClinics from "../../components/ClinicSelector/EmptyClinics";
import CompanySettingsButton from "../../components/ClinicSelector/CompanySettingsButton";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import AppModal from "../../components/Modals/AppModal";
import { addMembership } from "../../api/userApi";

const MAIN_BG =
  "linear-gradient(135deg, #ffe1da 0%, #fdf3ef 45%, #fff7f4 100%)";

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
    memberships,
  } = useAuth();

  const company = companies?.find((c) => c._id === selectedCompanyId) || null;
  const isOwner =
    user &&
    company &&
    user.uid &&
    company.ownerUserId &&
    user.uid === company.ownerUserId;

  const fetchedRef = useRef(false);

  // Modal state for join
  const [pendingJoinClinic, setPendingJoinClinic] = useState<Clinic | null>(
    null
  );
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    if (!idToken || !selectedCompanyId || fetchedRef.current) return;
    fetchedRef.current = true;
    getClinics(idToken, selectedCompanyId)
      .then((list: Clinic[]) => setClinics(list))
      .catch(() => {
        setClinics([]);
        fetchedRef.current = false;
      });
  }, [idToken, selectedCompanyId, setClinics]);

  // Clinic select logic
  const handleClinicSelect = (cl: Clinic) => {
    // Already a member of this clinic?
    const hasMembership = memberships.some(
      (m) => m.companyId === cl.companyId && m.clinicId === cl._id
    );
    if (hasMembership) {
      setSelectedClinicId(cl._id);
      setSelectedClinicName(cl.name);
      navigate(`/clinics/${cl._id}`, { replace: true });
    } else {
      setPendingJoinClinic(cl);
      setShowJoinModal(true);
    }
  };

  // Confirm join logic
  const handleConfirmJoin = async () => {
    if (!pendingJoinClinic || !idToken) return;
    await addMembership(idToken, {
      companyId: pendingJoinClinic.companyId,
      companyName: selectedCompanyName || "",
      clinicId: pendingJoinClinic._id,
      clinicName: pendingJoinClinic.name,
      roles: ["staff"],
    });
    setSelectedClinicId(pendingJoinClinic._id);
    setSelectedClinicName(pendingJoinClinic.name);
    setShowJoinModal(false);
    setPendingJoinClinic(null);
    navigate(`/clinics/${pendingJoinClinic._id}`, { replace: true });
  };
  const handleCancelJoin = () => {
    setShowJoinModal(false);
    setPendingJoinClinic(null);
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
    <div
      className="relative min-h-screen w-full flex flex-col"
      style={{ background: MAIN_BG, fontFamily: "'Inter', sans-serif" }}
    >
      {/* Logout button */}
      <button
        onClick={() => {
          signOut();
          navigate("/login", { replace: true });
        }}
        className="absolute top-4 right-4 z-20 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur text-[#e2725b] font-semibold rounded-2xl border border-white/30 shadow hover:bg-white/90 hover:text-red-600 transition active:scale-95 text-base"
        title="Çıkış Yap"
      >
        <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
        Çıkış
      </button>

      {/* HEADER at the top */}
      <div className="w-full flex flex-col items-center pt-10 pb-2 select-none">
        <ClinicSelectorHeader companyName={selectedCompanyName} />
      </div>

      {/* Spacer to push main to center */}
      <div className="flex-1" />

      {/* MAIN CONTENT (Clinic List/Empty State/Settings) */}
      <main className="w-full max-w-xl mx-auto flex flex-col items-center px-4 mb-20">
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
          <div className="w-full flex justify-center mt-8">
            <CompanySettingsButton
              onClick={() => navigate("/company-settings")}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <div className="absolute bottom-2 left-0 w-full text-center text-xs text-gray-400 pointer-events-none select-none z-0">
        © {new Date().getFullYear()} randevi
      </div>

      {/* Modal */}
      {pendingJoinClinic && (
        <AppModal open={showJoinModal} onClose={handleCancelJoin}>
          <div className="p-6 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-center">
              Bu kliniğe katılmak istiyor musunuz?
            </h2>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="font-bold text-[#e2725b] text-lg mb-1">
                {pendingJoinClinic.name}
              </div>
              <div className="text-gray-700 mb-1">
                <span className="font-semibold">Adres:</span>{" "}
                {pendingJoinClinic.address
                  ? Object.values(pendingJoinClinic.address)
                      .filter(Boolean)
                      .join(", ")
                  : "Adres yok"}
              </div>
              {pendingJoinClinic.phoneNumber && (
                <div className="text-gray-700">
                  <span className="font-semibold">Telefon:</span>{" "}
                  {pendingJoinClinic.phoneNumber}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelJoin}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Vazgeç
              </button>
              <button
                onClick={handleConfirmJoin}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Katıl
              </button>
            </div>
          </div>
        </AppModal>
      )}
    </div>
  );
}

export default ClinicSelectorPage;
