import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  BellIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { getNotifications } from "../../api/notificationApi";
import AddPatient from "../AddPatient/AddPatientModal";
import { NewAppointmentModal } from "../CalendarView/NewAppointmentModal";
import { ServiceModal } from "../Modals/ServiceModal/ServiceModal";
import { getPatients } from "../../api/patientApi";
import { getServices } from "../../api/servicesApi";
import { getEmployees } from "../../api/employeeApi";
import { createAppointment } from "../../api/appointmentApi";
import AppModal from "../Modals/AppModal";
import { EmployeeInfo, Patient, ServiceInfo } from "../../types/sharedTypes";

export const NavigationBar: React.FC = () => {
  const { idToken, companyId, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  const [showAddPatient, setShowAddPatient] = useState(false);
  const [activeModal, setActiveModal] = useState<"randevu" | "service" | null>(
    null
  );

  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [employees, setEmployees] = useState<EmployeeInfo[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [startStr, setStartStr] = useState("");
  const [endStr, setEndStr] = useState("");

  const isOwner = user?.role === "owner";
  const currentEmail = user?.email || "";

  useEffect(() => {
    if (!idToken || !companyId) return;
    getNotifications(idToken, companyId)
      .then((notifs) =>
        setUnreadCount(notifs.filter((n) => !n.isCalled).length)
      )
      .catch(() => setUnreadCount(0));
  }, [idToken, companyId]);

  useEffect(() => {
    if (!idToken || !companyId) return;
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
  }, [idToken, companyId]);

  const handleCreateAppointment = async (
    startISO: string,
    endISO: string,
    empEmail: string
  ) => {
    if (!idToken || !companyId) return;
    await createAppointment(
      idToken!,
      companyId!,
      selectedPatient,
      empEmail,
      selectedService,
      startISO,
      endISO
    );
    alert("Randevu başarıyla oluşturuldu.");
    setActiveModal(null);
    setShowAddModal(false);
  };

  return (
    <>
      <div className="fixed bottom-3 left-3 right-3 flex justify-center z-30 pointer-events-none">
        <nav
          className="
    bg-brand-main rounded-full
    flex flex-row justify-between items-center
    h-14 px-2 shadow-xl pointer-events-auto
    w-[min(98vw,410px)] mx-auto
    transition
  "
        >
          <NavLink to="/" className="flex-1 mx-[2px]">
            {({ isActive }) => (
              <div
                className={`flex items-center justify-center h-11 rounded-full px-2
          ${isActive ? "bg-white text-brand-main font-bold" : "text-white"}
          transition`}
              >
                <HomeIcon className="h-6 w-6" />
                {isActive && (
                  <span className="ml-2 text-base hidden sm:inline">Home</span>
                )}
              </div>
            )}
          </NavLink>
          <NavLink to="/dashboard" className="flex-1 mx-[2px]">
            {({ isActive }) => (
              <div
                className={`flex items-center justify-center h-11 rounded-full px-2
          ${isActive ? "bg-white text-brand-main font-bold" : "text-white"}
          transition`}
              >
                <BuildingOffice2Icon className="h-6 w-6" />
                {isActive && (
                  <span className="ml-2 text-base hidden sm:inline">Panel</span>
                )}
              </div>
            )}
          </NavLink>
          <button
            onClick={() => setShowAddModal(true)}
            className="
flex items-center justify-center h-11 rounded-full px-2 text-white
      "
            aria-label="Ekle"
          >
            <PlusIcon className="h-8 w-8" />
          </button>
          <NavLink to="/calendar" className="flex-1 mx-[2px]">
            {({ isActive }) => (
              <div
                className={`flex items-center justify-center h-11 rounded-full px-2
          ${isActive ? "bg-white text-brand-main font-bold" : "text-white"}
          transition`}
              >
                <CalendarIcon className="h-6 w-6" />
                {isActive && (
                  <span className="ml-2 text-base hidden sm:inline">
                    Takvim
                  </span>
                )}
              </div>
            )}
          </NavLink>
          <NavLink to="/notifications" className="flex-1 mx-[2px] relative">
            {({ isActive }) => (
              <div
                className={`flex items-center justify-center h-11 rounded-full px-2
          ${isActive ? "bg-white text-brand-main font-bold" : "text-white"}
          transition`}
              >
                <BellIcon className="h-6 w-6" />
                {isActive && (
                  <span className="ml-2 text-base hidden sm:inline">Çağrı</span>
                )}
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
                )}
              </div>
            )}
          </NavLink>
        </nav>
      </div>

      {/* Modal menu: white card with accent buttons */}
      <AppModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Ekle"
      >
        <div className="flex flex-col gap-4 bg-white rounded-2xl shadow-xl p-4 transition">
          <button
            onClick={() => {
              setShowAddPatient(true);
              setShowAddModal(false);
            }}
            className="w-full py-3 rounded-xl font-semibold bg-brand-main text-white hover:bg-brand-red transition"
          >
            Hasta Ekle
          </button>
          <button
            onClick={() => {
              setActiveModal("randevu");
              setShowAddModal(false);
            }}
            className="w-full py-3 rounded-xl font-semibold bg-brand-main text-white hover:bg-brand-red transition"
          >
            Randevu Ekle
          </button>
          <button
            onClick={() => {
              setActiveModal("service");
              setShowAddModal(false);
            }}
            className="w-full py-3 rounded-xl font-semibold bg-brand-main text-white hover:bg-brand-red transition"
          >
            Hizmet Ekle
          </button>
        </div>
      </AppModal>

      <AddPatient
        show={showAddPatient}
        onClose={() => setShowAddPatient(false)}
        idToken={idToken!}
        companyId={companyId!}
      />

      <NewAppointmentModal
        show={activeModal === "randevu"}
        onClose={() => setActiveModal(null)}
        patients={patients}
        employees={employees.map((e) => ({ ...e, name: e.name ?? "" }))}
        services={services.filter(
          (s): s is ServiceInfo & { _id: string } => typeof s._id === "string"
        )}
        isOwner={isOwner}
        currentEmail={currentEmail}
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
    </>
  );
};

export default NavigationBar;
