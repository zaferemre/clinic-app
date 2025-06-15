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

  // --- NAV BAR ---
  return (
    <>
      <nav
        className="
          fixed bottom-0 left-0 right-0 z-30
          bg-white 
          flex justify-between items-center h-20
          px-2
          border-t border-orange-100
          rounded-t-3xl
          shadow-[0_8px_32px_0_rgba(255,135,31,0.13)]
        "
        style={{
          boxShadow: "0 8px 32px 0 rgba(255,135,31,0.13)",
        }}
      >
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center justify-center flex-1 h-12 rounded-full mx-1 transition-all
            ${isActive ? "bg-orange-500 text-white p-3" : "text-orange-400"}`
          }
        >
          {({ isActive }) => (
            <>
              <HomeIcon className="h-7 w-7" />
              {isActive && <span className="ml-2 font-bold">Home</span>}
            </>
          )}
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center justify-center flex-1 h-12 rounded-full mx-1 transition-all
            ${isActive ? "bg-orange-500 text-white p-3 " : "text-orange-400"}`
          }
        >
          {({ isActive }) => (
            <>
              <BuildingOffice2Icon className="h-7 w-7" />
              {isActive && <span className="ml-2 font-bold">{"Panel"}</span>}
            </>
          )}
        </NavLink>

        {/* Center Add Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center h-14 w-14 rounded-full bg-orange-500 shadow-lg transition hover:scale-105 active:scale-95 border-4 border-white -mt-7 z-10"
          aria-label="Ekle"
        >
          <PlusIcon className="h-8 w-8 text-white" />
        </button>

        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            `flex items-center justify-center flex-1 h-12 rounded-full mx-1 transition-all
            ${isActive ? "bg-orange-500 text-white p-3" : "text-orange-400"}`
          }
        >
          {({ isActive }) => (
            <>
              <CalendarIcon className="h-7 w-7" />
              {isActive && <span className="ml-2 font-bold">Takvim</span>}
            </>
          )}
        </NavLink>

        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `relative flex items-center justify-center flex-1 h-12 rounded-full mx-1 transition-all
            ${isActive ? "bg-orange-500 text-white p-3" : "text-orange-400"}`
          }
        >
          {({ isActive }) => (
            <>
              <BellIcon className="h-7 w-7" />
              {isActive && <span className="ml-2 font-bold">Çağrılar</span>}
              {unreadCount > 0 && (
                <span className="absolute top-1 right-5 h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
              )}
            </>
          )}
        </NavLink>
      </nav>

      {/* Modals below (unchanged) */}
      <AppModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Ekle"
      >
        <div className="flex flex-col gap-4 bg-white/30 backdrop-blur-lg border border-white/30 rounded-2xl shadow-xl p-6 transition">
          <button
            onClick={() => {
              setShowAddPatient(true);
              setShowAddModal(false);
            }}
            className="w-full py-3 rounded-xl font-semibold bg-orange-500 text-white hover:bg-orange-600 shadow transition"
          >
            Hasta Ekle
          </button>
          <button
            onClick={() => {
              setActiveModal("randevu");
              setShowAddModal(false);
            }}
            className="w-full py-3 rounded-xl font-semibold bg-orange-400 text-white hover:bg-orange-500 shadow transition"
          >
            Randevu Ekle
          </button>
          <button
            onClick={() => {
              setActiveModal("service");
              setShowAddModal(false);
            }}
            className="w-full py-3 rounded-xl font-semibold bg-orange-300 text-white hover:bg-orange-400 shadow transition"
          >
            Hizmet Ekle
          </button>
          <button
            onClick={() => setShowAddModal(false)}
            className="w-full py-3 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 shadow transition"
          >
            Kapat
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
