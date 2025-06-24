import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useHomeData } from "../../hooks/useHomeData";
import { getPrimaryRole } from "../../utils/userRole";

import HomeHeader from "../../components/HomePage/HomeHeader";
import { HomeNavSection } from "../../components/HomePage/HomeNavSection";
import { HomeQuickActions } from "../../components/HomePage/HomeQuickActions";
import { HomeUpcomingAppointments } from "../../components/HomePage/HomeUpcomingAppointments";
import HomeModals, {
  HomeModalType,
} from "../../components/HomePage/HomeModals";
import NavigationBar from "../../components/NavigationBar/NavigationBar";
import NextAppointmentCard from "../../components/Cards/NextAppointmentCard";

import { useEnrichedAppointments } from "../../hooks/useEnrichedAppointments";
import { useTodaysAppointments } from "../../hooks/useTodaysAppointments";
import type { CardEmployee, EmployeeInfo } from "../../types/sharedTypes";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { idToken, selectedCompanyId, selectedClinicId, user } = useAuth();

  const {
    patients,
    services,
    employees: apiEmps,
    groups,
    loading: homeLoading,
    error: homeError,
    unreadCount,
    refresh: refreshHomeData,
  } = useHomeData(idToken!, selectedCompanyId!, selectedClinicId!, []);

  const { appointments: enrichedAppointments } = useEnrichedAppointments(
    idToken!,
    selectedCompanyId!,
    selectedClinicId!
  );

  const cardEmployees: CardEmployee[] = useMemo(
    () =>
      apiEmps.map((e: EmployeeInfo) => ({
        userId: e.userId,
        name: e.name ?? e.userId,
        avatarUrl: e.pictureUrl,
        role: Array.isArray(e.role) ? e.role.join(", ") : (e.role as string),
      })),
    [apiEmps]
  );

  const { appointments: todayAppointments } = useTodaysAppointments(
    enrichedAppointments,
    cardEmployees
  );

  // Build the exact shape NextAppointmentCard expects
  const nextAppointments = todayAppointments.map((a) => ({
    id: a.id,
    start: a.start,
    patientName: a.patientName ?? "",
    serviceName: a.serviceName ?? "",
  }));

  const [activeModal, setActiveModal] = useState<HomeModalType>(null);
  const userRole = getPrimaryRole(user, selectedCompanyId, selectedClinicId);

  if (!idToken || !selectedCompanyId || !selectedClinicId || !user) {
    return (
      <div className="h-screen flex items-center justify-center">
        Yükleniyor…
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 px-4 pt-6 pb-16 space-y-4">
        <HomeHeader />

        <div className="space-y-4">
          <NextAppointmentCard
            appointments={nextAppointments}
            onAddAppointment={() => setActiveModal("addAppointment")}
            onAppointmentClick={() => navigate("calendar")}
          />
        </div>

        <HomeNavSection unreadCount={unreadCount} />

        <HomeQuickActions
          onAddPatient={() => setActiveModal("addPatient")}
          onAddAppointment={() => setActiveModal("addAppointment")}
          onAddService={() => setActiveModal("addService")}
        />

        <HomeUpcomingAppointments
          appointments={todayAppointments}
          user={{ userId: user.uid, role: userRole! }}
          employees={cardEmployees}
        />

        {homeLoading && <div className="text-center py-4">Yükleniyor…</div>}
        {homeError && (
          <div className="text-center py-4 text-red-600">{homeError}</div>
        )}
      </main>

      <HomeModals
        activeModal={activeModal}
        closeModal={() => setActiveModal(null)}
        onAddPatientInModal={refreshHomeData}
        onServiceAdded={refreshHomeData}
        idToken={idToken}
        companyId={selectedCompanyId}
        clinicId={selectedClinicId}
        patients={patients}
        employees={apiEmps}
        services={services}
        groups={groups}
        isOwner={userRole === "owner"}
        currentUserId={user.uid}
        currentUserName={user.name ?? ""}
        selectedPatient=""
        setSelectedPatient={() => {}}
        selectedEmployee=""
        setSelectedEmployee={() => {}}
        selectedService=""
        setSelectedService={() => {}}
        selectedGroup=""
        setSelectedGroup={() => {}}
        startStr=""
        setStartStr={() => {}}
        endStr=""
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
