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
import { getEmployees } from "../../api/companyApi";
import { createAppointment } from "../../api/appointmentApi";
import AppModal from "../Modals/AppModal";

export const NavigationBar: React.FC = () => {
  const { idToken, companyId, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  const [showAddPatient, setShowAddPatient] = useState(false);
  const [activeModal, setActiveModal] = useState<"randevu" | "service" | null>(
    null
  );

  // Appointment modal fields
  const [patients, setPatients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [startStr, setStartStr] = useState("");
  const [endStr, setEndStr] = useState("");

  const isOwner = user?.role === "owner";
  const currentEmail = user?.email || "";

  // unread notifications
  useEffect(() => {
    if (!idToken || !companyId) return;
    getNotifications(idToken, companyId)
      .then((notifs) =>
        setUnreadCount(notifs.filter((n) => !n.isCalled).length)
      )
      .catch(() => setUnreadCount(0));
  }, [idToken, companyId]);

  // load form lists
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

  // --- COMPONENT ---
  return (
    <>
      {/* Glassy Nav */}
      <nav
        className="
          fixed bottom-0 left-0 right-0 z-30
          bg-white/60 backdrop-blur-xl
          shadow-[0_8px_32px_0_rgba(31,38,135,0.13)]
          flex justify-around items-center h-16
          border-t border-white/30
          rounded-t-3xl
        "
        style={{
          // subtle glass morph effect
          boxShadow: "0 8px 32px 0 rgba(31,38,135,0.13)",
          backdropFilter: "blur(16px)",
        }}
      >
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs font-semibold transition ${
              isActive ? "text-brand-green-500" : "text-gray-500"
            }`
          }
        >
          <HomeIcon className="h-6 w-6 mb-1" />
          Ana Sayfa
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs font-semibold transition ${
              isActive ? "text-brand-green-500" : "text-gray-500"
            }`
          }
        >
          <BuildingOffice2Icon className="h-6 w-6 mb-1" />
          Panel
        </NavLink>
        {/* "Add" Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="
            flex flex-col items-center text-xs font-semibold
            text-white bg-gradient-to-br from-brand-green-500 to-brand-blue-400
            shadow-lg rounded-full w-14 h-14 -mt-7 border-4 border-white
            hover:scale-105 active:scale-95 transition
            outline-none focus:ring-2 focus:ring-brand-green-200
            justify-center
          "
          style={{
            boxShadow: "0 8px 32px 0 rgba(31,38,135,0.14)",
          }}
          aria-label="Ekle"
        >
          <PlusIcon className="h-7 w-7 mb-0" />
          <span className="sr-only">Ekle</span>
        </button>
        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs font-semibold transition ${
              isActive ? "text-brand-green-500" : "text-gray-500"
            }`
          }
        >
          <CalendarIcon className="h-6 w-6 mb-1" />
          Takvim
        </NavLink>
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `relative flex flex-col items-center text-xs font-semibold transition ${
              isActive ? "text-brand-green-500" : "text-gray-500"
            }`
          }
        >
          {unreadCount > 0 && (
            <span className="absolute top-0 right-2 block h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
          )}
          <BellIcon className="h-6 w-6 mb-1" />
          Çağrılar
        </NavLink>
      </nav>

      {/* Add Modal, liquid glass style */}
      <AppModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Ekle"
      >
        <div
          className="
      flex flex-col gap-4
      bg-white/30
      backdrop-blur-lg
      border border-white/30
      rounded-2xl
      shadow-xl
      p-6
      transition
      "
          style={{
            boxShadow: "0 8px 32px 0 rgba(31,38,135,0.16)",
          }}
        >
          <button
            onClick={() => {
              setShowAddPatient(true);
              setShowAddModal(false);
            }}
            className="w-full py-3 rounded-xl font-semibold bg-brand-green-500 text-white hover:bg-brand-green-600 shadow transition"
          >
            Hasta Ekle
          </button>
          <button
            onClick={() => {
              setActiveModal("randevu");
              setShowAddModal(false);
            }}
            className="w-full py-3 rounded-xl font-semibold bg-brand-blue-500 text-white hover:bg-brand-blue-600 shadow transition"
          >
            Randevu Ekle
          </button>
          <button
            onClick={() => {
              setActiveModal("service");
              setShowAddModal(false);
            }}
            className="w-full py-3 rounded-xl font-semibold bg-indigo-500 text-white hover:bg-brand-indigo-600 shadow transition"
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

      {/* Modals for each form */}
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
        employees={employees}
        services={services}
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
