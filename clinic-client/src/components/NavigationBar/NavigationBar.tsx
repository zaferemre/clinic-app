// src/components/NavigationBar/NavigationBar.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getNotifications } from "../../api/notificationApi";
import { getPatients } from "../../api/patientApi";
import { getServices } from "../../api/servicesApi";
import { listEmployees } from "../../api/employeeApi";
import { listGroups } from "../../api/groupApi";
import { createAppointment } from "../../api/appointmentApi";
import AddPatient from "../Forms/CreatePatientForm";
import NewAppointmentModal from "../NewAppointment/index";
import { ServiceModal } from "../Modals/ServiceModal/ServiceModal";
import type {
  EmployeeInfo,
  Patient,
  ServiceInfo,
  Group,
} from "../../types/sharedTypes";
import NavBarNavLink from "./NavBarNavLink";
import NavBarAddButton from "./NavBarAddButton";
import NavBarAddModal from "./NavBarAddModal";
import NavBarNotificationBadge from "./NavBarNotificationBadge";

export const NavigationBar: React.FC = () => {
  const { idToken, selectedCompanyId, selectedClinicId, user } = useAuth();

  // --- UI state ---
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [activeModal, setActiveModal] = useState<"randevu" | "service" | null>(
    null
  );

  // --- Data state ---
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [employees, setEmployees] = useState<EmployeeInfo[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  // --- Modal state ---
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [startStr, setStartStr] = useState("");
  const [endStr, setEndStr] = useState("");
  const [modalDay] = useState<Date | undefined>(undefined);

  // --- Derived data ---
  // Determine if the user is an owner in any membership for this company
  const isOwner = user?.memberships?.some(
    (m) => m.companyId === selectedCompanyId && m.roles?.includes("owner")
  );

  const currentUserId = user?.uid ?? "";
  const currentUserName = user?.name ?? "";

  // --- Fetch unread notifications ---
  useEffect(() => {
    if (!idToken || !selectedCompanyId || !selectedClinicId) {
      setUnreadCount(0);
      return;
    }
    getNotifications(idToken, selectedCompanyId, selectedClinicId)
      .then((notifs) =>
        setUnreadCount(notifs.filter((n) => n.status === "pending").length)
      )
      .catch(() => setUnreadCount(0));
  }, [idToken, selectedCompanyId, selectedClinicId]);

  // --- Fetch patients, services, employees, groups ---
  useEffect(() => {
    if (!idToken || !selectedCompanyId || !selectedClinicId) {
      setPatients([]);
      setServices([]);
      setEmployees([]);
      setGroups([]);
      return;
    }
    Promise.all([
      getPatients(idToken, selectedCompanyId, selectedClinicId),
      getServices(idToken, selectedCompanyId, selectedClinicId),
      listEmployees(idToken, selectedCompanyId, selectedClinicId),
      listGroups(idToken, selectedCompanyId, selectedClinicId),
    ])
      .then(([p, s, e, g]) => {
        setPatients(p);
        setServices(s);
        setEmployees(e);
        setGroups(g);
      })
      .catch(() => {
        setPatients([]);
        setServices([]);
        setEmployees([]);
        setGroups([]);
      });
  }, [idToken, selectedCompanyId, selectedClinicId]);

  // --- Routing helper ---
  const clinicPath = (path: string) =>
    selectedClinicId ? `/clinics/${selectedClinicId}${path}` : "#";

  // --- Appointment creation handlers ---
  const handleCreateAppointment = async (
    startISO: string,
    endISO: string,
    employeeId: string,
    serviceId: string
  ) => {
    if (!idToken || !selectedCompanyId || !selectedClinicId) return;
    await createAppointment(idToken, selectedCompanyId, selectedClinicId, {
      patientId: selectedPatient,
      employeeId,
      serviceId,
      start: startISO,
      end: endISO,
      appointmentType: "individual",
    });

    setActiveModal(null);
    setShowAddModal(false);
    // Optionally: refetch lists here if needed
  };

  const handleCreateCustomAppointment = async (
    startISO: string,
    endISO: string,
    employeeId: string
  ) => {
    if (!idToken || !selectedCompanyId || !selectedClinicId) return;
    await createAppointment(idToken, selectedCompanyId, selectedClinicId, {
      employeeId,

      start: startISO,
      end: endISO,
      appointmentType: "individual",
    });
    alert("Takviminize özel engel eklendi.");
    setActiveModal(null);
    setShowAddModal(false);
    // Optionally: refetch lists here if needed
  };

  const handleCreateGroupAppointment = async (
    groupId: string,
    startISO: string,
    endISO: string,
    employeeId: string,
    serviceId: string
  ) => {
    if (!idToken || !selectedCompanyId || !selectedClinicId) return;
    await createAppointment(idToken, selectedCompanyId, selectedClinicId, {
      groupId,
      employeeId,
      serviceId,
      start: startISO,
      end: endISO,
      appointmentType: "group",
    });
    alert("Grup randevusu başarıyla oluşturuldu.");
    setActiveModal(null);
    setShowAddModal(false);
    // Optionally: refetch lists here if needed
  };

  return (
    <>
      {/* Navigation Bar */}
      <div className="fixed bottom-3 left-3 right-3 flex justify-center z-30 pointer-events-none">
        <nav className="bg-white rounded-full flex justify-between items-center h-14 px-2 shadow-xl pointer-events-auto w-[min(98vw,410px)] mx-auto transition">
          <div className="flex flex-1 items-center justify-center">
            <NavBarNavLink to={clinicPath("")} icon="home" label="Home" />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <NavBarNavLink
              to={clinicPath("/dashboard")}
              icon="dashboard"
              label="Panel"
            />
          </div>
          {/* AddButton: fixed size, no flex-grow, centered */}
          <div className="flex items-center justify-center w-16 relative -mt-8 z-10">
            <NavBarAddButton onClick={() => setShowAddModal(true)} />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <NavBarNavLink
              to={clinicPath("/calendar")}
              icon="calendar"
              label="Takvim"
            />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <NavBarNavLink
              to={clinicPath("/notifications")}
              icon="notifications"
              label="Çağrı"
              badge={<NavBarNotificationBadge unreadCount={unreadCount} />}
            />
          </div>
        </nav>
      </div>

      {/* Add Modal */}
      <NavBarAddModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        setShowAddPatient={setShowAddPatient}
        setActiveModal={setActiveModal}
      />

      {/* Add Patient Modal */}
      <AddPatient
        show={showAddPatient}
        onClose={() => setShowAddPatient(false)}
        idToken={idToken!}
        companyId={selectedCompanyId!}
        clinicId={selectedClinicId!}
      />

      {/* New Appointment Modal */}
      <NewAppointmentModal
        show={activeModal === "randevu"}
        onClose={() => setActiveModal(null)}
        patients={patients}
        employees={employees}
        services={services.filter(
          (s): s is ServiceInfo & { _id: string } => !!s._id
        )}
        groups={groups}
        isOwner={!!isOwner}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        selectedPatient={selectedPatient}
        setSelectedPatient={setSelectedPatient}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        startStr={startStr}
        setStartStr={setStartStr}
        endStr={endStr}
        setEndStr={setEndStr}
        modalDay={modalDay}
        onSubmitIndividual={handleCreateAppointment}
        onSubmitGroup={handleCreateGroupAppointment}
        onSubmitCustom={handleCreateCustomAppointment}
        onAddPatient={() => setShowAddPatient(true)}
      />

      {/* Service Modal */}
      <ServiceModal
        show={activeModal === "service"}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
};

export default NavigationBar;
