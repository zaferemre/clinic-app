// src/components/CalendarView/CalendarView.tsx
import React, { useState, useEffect } from "react";
import FullCalendar, {
  DateSelectArg,
  EventClickArg,
  EventInput,
  ViewApi,
} from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";

import {
  getAppointments,
  createAppointment,
  deleteAppointment,
} from "../../api/appointmentApi";
import { getPatients } from "../../api/patientApi";
import { useAuth } from "../../contexts/AuthContext";
import AddPatient from "../AddPatient/AddPatient";
import { AppointmentModal } from "../AppointmentModal";
import { CalendarEmployee } from "../CalendarEmployeeSelector/CalendarEmployeeSelector";
import { NewAppointmentModal } from "./NewAppointmentModal";
import { ServiceAndEmployeeFilter } from "./ServiceAndEmployeeFilter";

import { API_BASE } from "../../config/apiConfig";

interface Service {
  _id: string;
  serviceName: string;
  serviceDuration: number;
}

export const CalendarView: React.FC = () => {
  const { idToken, companyId, user } = useAuth();
  const currentEmail = user!.email;

  const [ownerEmail, setOwnerEmail] = useState<string>("");
  const [events, setEvents] = useState<EventInput[]>([]);
  const [patients, setPatients] = useState<
    { _id: string; name: string; credit: number }[]
  >([]);
  const [employees, setEmployees] = useState<CalendarEmployee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedSpan, setSelectedSpan] = useState<DateSelectArg | null>(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [modalEvent, setModalEvent] = useState<EventInput | null>(null);

  const isOwner = currentEmail === ownerEmail;

  // Helper to format a Date to the "YYYY-MM-DDTHH:mm" format for <input type="datetime-local">
  const toDateTimeLocal = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  // Load company owner
  useEffect(() => {
    if (!idToken || !companyId) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/company/${companyId}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const c = await res.json();
        setOwnerEmail(c.ownerEmail);
      } catch {
        setOwnerEmail("");
      }
    })();
  }, [idToken, companyId]);

  // Load patients
  useEffect(() => {
    if (!idToken || !companyId) return;
    (async () => {
      try {
        const list = await getPatients(idToken, companyId);
        setPatients(
          list.map((p) => ({ _id: p._id, name: p.name, credit: p.credit }))
        );
      } catch {
        setPatients([]);
      }
    })();
  }, [idToken, companyId, showAddPatient]);

  // Load employees
  useEffect(() => {
    if (!idToken || !companyId) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/company/${companyId}/employees`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setEmployees(await res.json());
      } catch {
        setEmployees([]);
      }
    })();
  }, [idToken, companyId]);

  // Load services
  useEffect(() => {
    if (!idToken || !companyId) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/company/${companyId}/services`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const data: Service[] = await res.json();
        setServices(Array.isArray(data) ? data : []);
      } catch {
        setServices([]);
      }
    })();
  }, [idToken, companyId]);

  // Fetch and filter events
  const fetchAppointments = async () => {
    if (!idToken || !companyId) return;
    try {
      const data = await getAppointments(idToken, companyId);
      const filtered = data.filter((ev) => {
        const matchEmp = selectedEmployee
          ? ev.extendedProps.employeeEmail === selectedEmployee
          : true;
        const matchSvc = selectedService
          ? ev.extendedProps.serviceId === selectedService
          : true;
        return matchEmp && matchSvc;
      });
      const palette = ["#34D399", "#93C5FD", "#FDBA74", "#F9A8D4", "#FCA5A5"];
      const now = Date.now();
      setEvents(
        filtered.map((ev, idx) => ({
          id: ev.id,
          title: ev.title,
          start: ev.start,
          end: ev.end,
          color:
            now > new Date(ev.end).getTime()
              ? "#9CA3AF"
              : palette[idx % palette.length],
          extendedProps: ev.extendedProps,
        }))
      );
    } catch {
      setEvents([]);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [idToken, companyId, selectedEmployee, selectedService]);

  // Selection handlers
  const handleDateSelect = (info: DateSelectArg) => {
    if (!isOwner && selectedEmployee !== currentEmail) {
      alert("Sadece kendi programınızı düzenleyebilirsiniz.");
      return;
    }
    const startLocal = toDateTimeLocal(info.start);
    const endLocal = toDateTimeLocal(info.end);
    setSelectedSpan({ ...info, startStr: startLocal, endStr: endLocal });
  };

  const handleDateClick = (ci: { date: Date; view: ViewApi }) =>
    handleDateSelect({
      start: ci.date,
      end: new Date(ci.date.getTime() + 3600_000),
      allDay: false,
      view: ci.view,
      jsEvent: undefined as any,
      startStr: "",
      endStr: "",
    } as DateSelectArg);

  const handleCreate = async () => {
    if (
      !selectedSpan ||
      !selectedPatient ||
      !selectedEmployee ||
      !selectedService
    ) {
      alert("Lütfen hasta, çalışan ve hizmet seçin.");
      return;
    }
    if (!isOwner && selectedEmployee !== currentEmail) {
      alert("Yetkiniz yok.");
      return;
    }
    try {
      await createAppointment(
        idToken!,
        companyId!,
        selectedPatient,
        selectedEmployee,
        selectedService,
        selectedSpan.startStr,
        selectedSpan.endStr
      );
      setSelectedSpan(null);
      setSelectedPatient("");
      setSelectedEmployee("");
      setSelectedService("");
      window.dispatchEvent(new Event("refresh"));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Oluşturulamadı.");
    }
  };

  // Event click/cancel
  const handleEventClick = (ci: EventClickArg) => {
    const we = ci.event.extendedProps["employeeEmail"];
    if (!isOwner && we !== currentEmail) {
      alert("Sadece kendi randevularınızı düzenleyebilirsiniz.");
      return;
    }
    setModalEvent({
      id: ci.event.id,
      title: ci.event.title,
      start: ci.event.startStr,
      end: ci.event.endStr,
      color: ci.event.backgroundColor,
    });
  };

  const handleCancel = async (id: string) => {
    await deleteAppointment(idToken!, companyId!, id);
    setModalEvent(null);
    window.dispatchEvent(new Event("refresh"));
  };

  return (
    <div className="flex flex-col flex-1 bg-brand-gray-100">
      <ServiceAndEmployeeFilter
        employees={employees}
        selectedEmployee={selectedEmployee}
        onEmployeeChange={setSelectedEmployee}
        services={services}
        selectedService={selectedService}
        onServiceChange={setSelectedService}
      />

      {showAddPatient && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center">
          <AddPatient companyId={companyId!} idToken={idToken!} />
          <button
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={() => setShowAddPatient(false)}
          >
            ×
          </button>
        </div>
      )}

      {modalEvent && (
        <AppointmentModal
          event={modalEvent}
          onClose={() => setModalEvent(null)}
          onCancel={handleCancel}
        />
      )}

      <NewAppointmentModal
        show={!!selectedSpan}
        onClose={() => {
          setSelectedSpan(null);
          setSelectedPatient("");
          setSelectedEmployee("");
          setSelectedService("");
        }}
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
        startStr={selectedSpan?.startStr || ""}
        setStartStr={(val) => {
          if (selectedSpan) setSelectedSpan({ ...selectedSpan, startStr: val });
        }}
        endStr={selectedSpan?.endStr || ""}
        setEndStr={(val) => {
          if (selectedSpan) setSelectedSpan({ ...selectedSpan, endStr: val });
        }}
        onSubmit={handleCreate}
        onAddPatient={() => setShowAddPatient(true)}
      />

      <div className="flex-1 mx-4 mb-4 bg-white rounded-xl shadow overflow-auto">
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            bootstrap5Plugin,
          ]}
          themeSystem="bootstrap5"
          initialView={"threeDay"}
          views={{
            timeGridDay: { buttonText: "Gün" },
            threeDay: {
              type: "timeGrid",
              duration: { days: 3 },
              buttonText: "3 Gün",
            },

            timeGridWeek: { buttonText: "Hafta" },
            dayGridMonth: { buttonText: "Ay" },
          }}
          headerToolbar={{
            start: "prev,next today",
            center: "title",
            end: "timeGridDay,threeDay,timeGridWeek,dayGridMonth",
          }}
          allDaySlot={false}
          selectable
          selectMirror
          select={handleDateSelect}
          dateClick={handleDateClick}
          editable
          eventClick={handleEventClick}
          events={events}
          eventDisplay="block"
          slotMinTime="08:00:00"
          slotMaxTime="22:00:00"
          slotLabelFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
          nowIndicator
          height="auto"
        />
      </div>
    </div>
  );
};
