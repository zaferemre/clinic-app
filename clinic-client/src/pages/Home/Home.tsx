// src/pages/Home/Home.tsx
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useHomeData } from "../../hooks/useHomeData";
import { useTodaysAppointments } from "../../hooks/useTodaysAppointments";

import HomeHeader from "../../components/HomePage/HomeHeader";
import { HomeNavSection } from "../../components/HomePage/HomeNavSection";
import { HomeQuickActions } from "../../components/HomePage/HomeQuickActions";
import { HomeUpcomingAppointments } from "../../components/HomePage/HomeUpcomingAppointments";
import HomeModals, {
  HomeModalType,
} from "../../components/HomePage/HomeModals";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";

const Home: React.FC = () => {
  const {
    idToken,
    selectedCompanyId,

    selectedClinicId,

    user,
  } = useAuth();

  // allow our null business IDs
  const {
    patients,
    services,
    employees,
    groups,
    loading: homeLoading,
    error: homeError,
    unreadCount = 0,
    refresh: refreshHomeData,
  } = useHomeData(
    idToken ?? undefined,
    selectedCompanyId ?? undefined,
    selectedClinicId ?? undefined,
    []
  );

  const { appointments: todaysAppointments, employees: allEmployees } =
    useTodaysAppointments(
      idToken ?? "",
      selectedCompanyId ?? "",
      selectedClinicId ?? ""
    );

  // track which modal is open
  const [activeModal, setActiveModal] = useState<HomeModalType>(null);

  if (!idToken || !selectedCompanyId || !selectedClinicId || !user) {
    return (
      <div className="h-screen flex items-center justify-center">
        Yükleniyor…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-16">
      <div className="flex-1 overflow-auto px-4 py-4 space-y-4">
        <HomeHeader />

        <HomeNavSection unreadCount={unreadCount} />

        <HomeQuickActions
          onAddPatient={() => setActiveModal("addPatient")}
          onAddAppointment={() => setActiveModal("addAppointment")}
          onAddService={() => setActiveModal("addService")}
        />

        <HomeUpcomingAppointments
          appointments={todaysAppointments}
          user={{ email: user.email, role: user.role ?? "" }}
          employees={allEmployees}
        />

        {homeLoading && <div>Yükleniyor…</div>}
        {homeError && <div className="text-red-600">{homeError}</div>}
      </div>

      <HomeModals
        activeModal={activeModal}
        closeModal={() => setActiveModal(null)}
        onAddPatientInModal={refreshHomeData}
        onServiceAdded={refreshHomeData}
        idToken={idToken}
        companyId={selectedCompanyId}
        clinicId={selectedClinicId}
        patients={patients}
        employees={employees}
        services={services}
        groups={groups}
        isOwner={user.role === "owner"}
        currentUserId={user.email}
        currentUserName={user.name ?? ""}
        selectedPatient={""}
        setSelectedPatient={() => {}}
        selectedEmployee={""}
        setSelectedEmployee={() => {}}
        selectedService={""}
        setSelectedService={() => {}}
        selectedGroup={""}
        setSelectedGroup={() => {}}
        startStr={""}
        setStartStr={() => {}}
        endStr={""}
        setEndStr={() => {}}
        onSubmitIndividual={() => {}}
        onSubmitGroup={() => {}}
        onSubmitCustom={() => {}}
      />

      <NavigationBar />
    </div>
  );
};

export default Home;
