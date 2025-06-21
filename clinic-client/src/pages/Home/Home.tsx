/* src/pages/Home.tsx */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import NavigationBar from "../../components/NavigationBar/NavigationBar";
import NextAppointmentCard from "../../components/Cards/NextAppointmentCard";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { idToken, selectedCompanyId, selectedClinicId, user } = useAuth();

  const {
    patients,
    services,
    employees,
    groups,
    loading: homeLoading,
    error: homeError,
    unreadCount,

    refresh: refreshHomeData,
  } = useHomeData(idToken!, selectedCompanyId!, selectedClinicId!, []);

  const { appointments, employees: allEmployees } = useTodaysAppointments(
    idToken!,
    selectedCompanyId!,
    selectedClinicId!
  );

  const [activeModal, setActiveModal] = useState<HomeModalType>(null);

  if (!idToken || !selectedCompanyId || !selectedClinicId || !user) {
    return (
      <div className="h-screen flex items-center justify-center">
        Yükleniyor…
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 px-4 pt-6 pb-16 space-y-6">
        {/* Header */}
        <HomeHeader />

        {/* Top Section: Notifications + Next Appointment */}
        <div className="space-y-4">
          <NextAppointmentCard
            appointments={appointments.map((a) => ({
              ...a,
              patientName: a.patientName!,
            }))}
            onAddAppointment={() => setActiveModal("addAppointment")}
            onAppointmentClick={() => navigate("calendar")}
          />
        </div>

        {/* Navigation Tiles */}
        <HomeNavSection unreadCount={unreadCount} />

        {/* Quick Action Buttons */}
        <HomeQuickActions
          onAddPatient={() => setActiveModal("addPatient")}
          onAddAppointment={() => setActiveModal("addAppointment")}
          onAddService={() => setActiveModal("addService")}
        />

        {/* Today's Appointments List */}
        <HomeUpcomingAppointments
          appointments={appointments}
          user={{ email: user.email, role: user.role }}
          employees={allEmployees}
        />

        {homeLoading && <div className="text-center py-4">Yükleniyor…</div>}
        {homeError && (
          <div className="text-center py-4 text-red-600">{homeError}</div>
        )}
      </main>

      {/* Modals */}
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
        currentUserName={user.name}
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

      {/* Bottom Navigation */}
      <NavigationBar />
    </div>
  );
};

export default Home;
