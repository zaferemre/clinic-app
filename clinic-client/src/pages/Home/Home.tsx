// src/pages/Home/Home.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { GreetingHeader } from "../../components/GreetingHeader/GreetingHeader";
import { QuickActionsRow } from "../../components/QuickActionsRow/QuickActionsRow";
import { UpcomingAppointments } from "../../components/UpcomingAppointments/UpcomingAppointments";
import { HomeNavGrid } from "../../components/HomeNavGrid/HomeNavGrid";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";
import { useTodaysAppointments } from "../../hooks/useTodaysAppointments";
import { getNotifications } from "../../api/notificationApi";
import AddPatient from "../../components/AddPatient/AddPatientModal";
import { NewAppointmentModal } from "../../components/CalendarView/NewAppointmentModal";
import { ServiceModal } from "../../components/Modals/ServiceModal/ServiceModal";
import { getPatients } from "../../api/patientApi";
import { getServices } from "../../api/servicesApi";
import { getEmployees } from "../../api/employeeApi";
import { createAppointment } from "../../api/appointmentApi";
import type {
  NotificationInfo,
  Patient as PatientType,
  ServiceInfo,
  EmployeeInfo,
} from "../../types/sharedTypes";

const Home: React.FC = () => {
  const { idToken, companyId, companyName, user } = useAuth();

  // **All hooks run at top level**:
  const [unreadCount, setUnreadCount] = useState(0);

  const { appointments: todaysAppointments, employees: allEmployees } =
    useTodaysAppointments(idToken ?? "", companyId ?? "");

  const [showAddPatient, setShowAddPatient] = useState(false);
  const [activeModal, setActiveModal] = useState<"randevu" | "service" | null>(
    null
  );

  const [patients, setPatients] = useState<PatientType[]>([]);
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [employees, setEmployees] = useState<EmployeeInfo[]>([]);

  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [startStr, setStartStr] = useState("");
  const [endStr, setEndStr] = useState("");

  // fetch unread count
  useEffect(() => {
    const fetchUnread = async () => {
      if (!idToken || !companyId) {
        setUnreadCount(0);
        return;
      }
      try {
        const notifs: NotificationInfo[] = await getNotifications(
          idToken,
          companyId
        );
        setUnreadCount(notifs.filter((n) => !n.isCalled).length);
      } catch {
        setUnreadCount(0);
      }
    };
    fetchUnread();
  }, [idToken, companyId]);

  // preload lists when any modal opens
  useEffect(() => {
    if (!idToken || !companyId) return;
    if (showAddPatient || activeModal) {
      Promise.all([
        getPatients(idToken, companyId),
        getServices(idToken, companyId),
        getEmployees(idToken, companyId),
      ])
        .then(([p, s, e]) => {
          setPatients(p);
          setServices(s);
          setEmployees(e);
        })
        .catch(console.error);
    }
  }, [idToken, companyId, showAddPatient, activeModal]);

  // **Now that all hooks are declared, we can guard render:**
  if (!idToken || !companyId || !companyName || !user) {
    return null;
  }

  // create appointment handler
  const handleCreateAppointment = async (
    startISO: string,
    endISO: string,
    empEmail: string
  ) => {
    await createAppointment(
      idToken,
      companyId,
      selectedPatient,
      empEmail,
      selectedService,
      startISO,
      endISO
    );
    alert("Randevu başarıyla oluşturuldu.");
    setActiveModal(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-16">
      <div className="flex-1 overflow-auto px-4 py-4 space-y-4">
        <GreetingHeader
          userName={user.name}
          userAvatarUrl={user.imageUrl || ""}
          companyName={companyName}
        />

        <div className="rounded-2xl shadow bg-white p-2">
          <HomeNavGrid unreadCount={unreadCount} />
        </div>

        <QuickActionsRow
          onAddPatient={() => setShowAddPatient(true)}
          onAddAppointment={() => setActiveModal("randevu")}
          onAddService={() => setActiveModal("service")}
        />

        <UpcomingAppointments
          appointments={todaysAppointments}
          user={{ email: user.email, role: user.role ?? "" }}
          employees={allEmployees}
        />
      </div>

      <AddPatient
        show={showAddPatient}
        onClose={() => setShowAddPatient(false)}
        idToken={idToken}
        companyId={companyId}
      />

      <NewAppointmentModal
        show={activeModal === "randevu"}
        onClose={() => setActiveModal(null)}
        patients={patients}
        employees={employees.map((e) => ({ ...e, name: e.name ?? "" }))}
        services={services.filter(
          (s): s is ServiceInfo & { _id: string } => typeof s._id === "string"
        )}
        isOwner={user.role === "owner"}
        currentEmail={user.email}
        selectedPatient={selectedPatient}
        setSelectedPatient={setSelectedPatient}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        startStr={startStr}
        setStartStr={setStartStr}
        endStr={endStr}
        setEndStr={setEndStr}
        onSubmit={handleCreateAppointment}
        onAddPatient={() => {
          setActiveModal(null);
          setShowAddPatient(true);
        }}
      />

      <ServiceModal
        show={activeModal === "service"}
        onClose={() => setActiveModal(null)}
        onSubmit={() => setActiveModal(null)}
      />

      <NavigationBar />
    </div>
  );
};

export default Home;
