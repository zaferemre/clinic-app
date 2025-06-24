import React, { useState } from "react";
import { PlusIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import CreatePatientForm from "../../components/Forms/CreatePatientForm";
import CreateGroupForm from "../../components/Forms/CreateGroupForm";
import { PatientsList } from "../../components/Lists/PatientsList/PatientsList";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";
import GroupsList from "../../components/Lists/GroupList/GroupList";
import GreetingHeader from "../../components/GreetingHeader/GreetingHeader";
import { Group, Patient } from "../../types/sharedTypes";

// --- Empty State components ---
const EmptyPatients = ({ onAdd }: { onAdd: () => void }) => (
  <div className="mx-4 flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl mb-8">
    <UserPlusIcon className="w-16 h-16 text-brand-main mb-4" />
    <div className="text-lg font-semibold text-brand-gray-700 mb-2">
      Henüz hiç müşteri eklenmemiş.
    </div>
    <div className="text-brand-gray-500 mb-4">
      Müşteri ekleyerek hasta takibine başlayabilirsiniz.
    </div>
    <button
      onClick={onAdd}
      className="mt-2 bg-brand-main text-white px-5 py-2 rounded-xl font-semibold hover:bg-brand-red-300 transition"
    >
      + Müşteri Ekle
    </button>
  </div>
);

const EmptyGroups = ({ onAdd }: { onAdd: () => void }) => (
  <div className="mx-4 flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl mb-8">
    <UserGroupIcon className="w-16 h-16 text-brand-main mb-4" />
    <div className="text-lg font-semibold text-brand-gray-700 mb-2">
      Henüz hiç grup eklenmemiş.
    </div>
    <div className="text-brand-gray-500 mb-4">
      Grup oluşturarak toplu seanslar başlatabilirsiniz.
    </div>
    <button
      onClick={onAdd}
      className="mt-2 bg-brand-main text-white px-5 py-2 rounded-xl font-semibold hover:bg-brand-red-300 transition"
    >
      + Grup Oluştur
    </button>
  </div>
);

const PatientsPage: React.FC = () => {
  const {
    idToken,
    selectedCompanyId,
    selectedClinicId,
    selectedCompanyName,
    selectedClinicName,
    user,
  } = useAuth();

  const [tab, setTab] = useState<"patients" | "groups">("patients");
  const [showModal, setShowModal] = useState<null | "patient" | "group">(null);
  const [fabOpen, setFabOpen] = useState(false);

  const [patientRefreshKey, setPatientRefreshKey] = useState(0);
  const [groupRefreshKey, setGroupRefreshKey] = useState(0);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const tabName = tab === "patients" ? "Müşteriler" : "Gruplar";

  if (
    !idToken ||
    !selectedCompanyId ||
    !selectedClinicId ||
    !selectedCompanyName ||
    !selectedClinicName ||
    !user
  ) {
    console.log({
      idToken,
      selectedCompanyId,
      selectedClinicId,
      selectedCompanyName,
      selectedClinicName,
      user,
    });
    return null;
  }

  // New: Use `photoUrl` (fallback to initials if not present)
  const avatarUrl =
    user.photoUrl ||
    (user.name
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user.name
        )}&background=E2725B&color=fff`
      : "");

  return (
    <div className="flex flex-col h-screen pb-16 bg-brand-gray-100 relative">
      {/* Unified Header */}
      <div className="px-4 pt-4">
        <GreetingHeader
          userAvatarUrl={avatarUrl}
          clinicName={selectedClinicName}
          pageTitle={tabName}
          showBackButton={true}
        />
      </div>

      {/* Tab selector */}
      <div className="sticky top-0 z-10 bg-brand-gray-100 px-4 pb-3">
        <div className="flex gap-2">
          <button
            className={
              tab === "patients"
                ? "flex-1 py-2 rounded-full bg-brand-main text-white text-base font-bold "
                : "flex-1 py-2 rounded-full bg-white text-brand-main text-base font-bold  border border-brand-main"
            }
            onClick={() => setTab("patients")}
          >
            Müşteriler
          </button>
          <button
            className={
              tab === "groups"
                ? "flex-1 py-2 rounded-full bg-brand-main text-white text-base font-bold "
                : "flex-1 py-2 rounded-full bg-white text-brand-main text-base font-bold  border border-brand-main"
            }
            onClick={() => setTab("groups")}
          >
            Gruplar
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {tab === "patients" ? (
          <PatientsList
            companyId={selectedCompanyId}
            clinicId={selectedClinicId}
            idToken={idToken}
            refreshKey={patientRefreshKey}
            setPatients={setPatients} // <--- New prop
          />
        ) : (
          <GroupsList
            companyId={selectedCompanyId}
            clinicId={selectedClinicId}
            idToken={idToken}
            refreshKey={groupRefreshKey}
            setGroups={setGroups} // <--- New prop
          />
        )}

        {/* Empty state handling */}
        {tab === "patients" && patients.length === 0 && (
          <EmptyPatients onAdd={() => setShowModal("patient")} />
        )}
        {tab === "groups" && groups.length === 0 && (
          <EmptyGroups onAdd={() => setShowModal("group")} />
        )}
      </div>

      {/* Navigation */}
      <NavigationBar />

      {/* FAB */}
      <div className="fixed bottom-24 right-4 z-30">
        <div className="relative">
          {fabOpen && (
            <div className="absolute bottom-16 right-0 flex flex-col gap-3 items-end animate-fade-in">
              <button
                onClick={() => {
                  setShowModal("patient");
                  setFabOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-brand-main text-white rounded-xl  font-bold hover:bg-brand-red transition"
              >
                <UserPlusIcon className="h-7" /> Müşteri Ekle
              </button>
              <button
                onClick={() => {
                  setShowModal("group");
                  setFabOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-xl  font-bold hover:bg-brand-fuchsia transition"
              >
                <UserGroupIcon className="h-7" /> Grup Oluştur
              </button>
            </div>
          )}
          <button
            className="w-14 h-14 rounded-full bg-brand-main flex items-center justify-center text-white hover:bg-brand-red transition text-3xl"
            onClick={() => setFabOpen((o) => !o)}
            aria-label="Yeni ekle"
          >
            <PlusIcon className="h-8 w-8" />
          </button>
        </div>
      </div>

      {/* Modals */}
      {showModal === "patient" && (
        <CreatePatientForm
          idToken={idToken}
          companyId={selectedCompanyId}
          clinicId={selectedClinicId}
          show={true}
          onClose={() => setShowModal(null)}
          onCreated={() => setPatientRefreshKey((k) => k + 1)}
        />
      )}
      {showModal === "group" && (
        <CreateGroupForm
          idToken={idToken}
          companyId={selectedCompanyId}
          clinicId={selectedClinicId}
          show={true}
          onClose={() => setShowModal(null)}
          onCreated={() => setGroupRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
};

export default PatientsPage;
