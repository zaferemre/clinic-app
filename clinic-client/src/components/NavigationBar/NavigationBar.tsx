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

import AddPatient from "../AddPatient/AddPatient";
import { NewAppointmentModal } from "../CalendarView/NewAppointmentModal";
import { ServiceModal } from "../Modals/ServiceModal/ServiceModal";
import { getPatients } from "../../api/patientApi";
import { getServices } from "../../api/servicesApi";
import { getEmployees } from "../../api/companyApi";
import { createAppointment } from "../../api/appointmentApi";

export const NavigationBar: React.FC = () => {
  const { idToken, companyId, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
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

  const closeAll = () => {
    setMenuOpen(false);
  };

  const openModal = (modal: "randevu" | "service") => {
    setActiveModal(modal);
    closeAll();
  };

  const handleCreateAppointment = async (
    startISO: string,
    endISO: string,
    empEmail: string
  ) => {
    if (!idToken || !companyId) return;
    // ✅ correct: six separate parameters
    await createAppointment(
      idToken!,
      companyId!,
      selectedPatient,
      empEmail,
      selectedService,
      startISO,
      endISO
    );
    // Show confirmation, then close the modal
    alert("Randevu başarıyla oluşturuldu.");
    setActiveModal(null);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-t flex justify-around items-center h-16">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? "text-green-600" : "text-gray-500"
            }`
          }
        >
          <HomeIcon className="h-6 w-6 mb-1" />
          Ana Sayfa
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? "text-green-600" : "text-gray-500"
            }`
          }
        >
          <BuildingOffice2Icon className="h-6 w-6 mb-1" />
          Panel
        </NavLink>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex flex-col items-center text-xs text-gray-500"
        >
          <PlusIcon className="h-6 w-6 mb-1" />
          Ekle
        </button>
        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? "text-green-600" : "text-gray-500"
            }`
          }
        >
          <CalendarIcon className="h-6 w-6 mb-1" />
          Takvim
        </NavLink>
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `relative flex flex-col items-center text-xs ${
              isActive ? "text-green-600" : "text-gray-500"
            }`
          }
        >
          {unreadCount > 0 && (
            <span className="absolute top-0 right-1 block h-2 w-2 rounded-full bg-red-500" />
          )}
          <BellIcon className="h-6 w-6 mb-1" />
          Çağrılar
        </NavLink>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 space-y-4 shadow-lg">
            <button
              onClick={() => setShowAddPatient(true)}
              className="w-full py-2 bg-green-600 text-white rounded"
            >
              Hasta Ekle
            </button>
            <button
              onClick={() => openModal("randevu")}
              className="w-full py-2 bg-blue-600 text-white rounded"
            >
              Randevu Ekle
            </button>
            <button
              onClick={() => openModal("service")}
              className="w-full py-2 bg-indigo-600 text-white rounded"
            >
              Hizmet Ekle
            </button>
            <button
              onClick={closeAll}
              className="w-full py-2 text-gray-700 rounded border"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      <AddPatient
        show={showAddPatient}
        onClose={() => setShowAddPatient(false)}
        idToken={idToken!}
        companyId={companyId!}
      />

      {activeModal === "randevu" && (
        <NewAppointmentModal
          show
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
          onAddPatient={() => setShowAddPatient(true)}
        />
      )}

      {activeModal === "service" && (
        <ServiceModal
          show
          onSubmit={() => setActiveModal(null)}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  );
};

export default NavigationBar;
