import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import {
  DateSelectArg,
  EventClickArg,
  ViewApi,
  EventDropArg,
} from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import {
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import trLocale from "@fullcalendar/core/locales/tr";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../../api/appointmentApi";
import { getPatients } from "../../api/patientApi";
import { useAuth } from "../../contexts/AuthContext";
import AddPatient from "../AddPatient/AddPatient";
import { AppointmentModal } from "../AppointmentModal";
import { NewAppointmentModal } from "./NewAppointmentModal";
import { ServiceAndEmployeeFilter } from "./ServiceAndEmployeeFilter";
import { API_BASE } from "../../config/apiConfig";

interface Service {
  _id: string;
  serviceName: string;
  serviceDuration: number;
}
interface Employee {
  _id?: string; // or whatever your employee identifier is
  email: string;
  name: string;
}

interface CalendarEvent {
  id: string;
  patientName: string;
  employeeId: string;
  serviceId: string;
  start: string;
  end: string;
  // ...other fields
}

export const CalendarView: React.FC = () => {
  const { idToken, companyId, user } = useAuth();
  const currentEmail = user!.email;

  const [ownerEmail, setOwnerEmail] = useState<string>("");
  const [events, setEvents] = useState<any[]>([]);
  const [patients, setPatients] = useState<
    { _id: string; name: string; credit: number }[]
  >([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedSpan, setSelectedSpan] = useState<DateSelectArg | null>(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [modalEvent, setModalEvent] = useState<any | null>(null);

  const calendarRef = useRef<FullCalendar | null>(null);
  const [calendarDate] = useState<string>("");
  const [calendarView] = useState<string>("threeDay");

  const isOwner = currentEmail === ownerEmail;

  // Lookup helpers
  const getServiceName = (id: string) =>
    services.find((s) => s._id === id)?.serviceName ?? "";
  const getEmployeeName = (id: string) =>
    employees.find((e) => e.email === id || e._id === id)?.name ?? "";

  // Owner load
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

  // Patients
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

  // Employees
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

  // Services
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

  // Appointments load/mapping
  const fetchAppointments = async () => {
    if (!idToken || !companyId) return;
    try {
      const data: CalendarEvent[] = await getAppointments(idToken, companyId);
      // filter by selected employee/service
      const filtered = data.filter((ev) => {
        const matchEmp = selectedEmployee
          ? ev.employeeId === selectedEmployee
          : true;
        const matchSvc = selectedService
          ? ev.serviceId === selectedService
          : true;
        return matchEmp && matchSvc;
      });
      const palette = ["#34D399", "#93C5FD", "#FDBA74", "#F9A8D4", "#FCA5A5"];
      const now = Date.now();
      setEvents(
        filtered.map((ev, idx) => ({
          id: ev.id,
          title: `${ev.patientName} • ${getServiceName(ev.serviceId)}`,
          start: ev.start,
          end: ev.end,
          color:
            now > new Date(ev.end).getTime()
              ? "#9CA3AF"
              : palette[idx % palette.length],
          extendedProps: {
            employeeId: ev.employeeId,
            employeeName: getEmployeeName(ev.employeeId),
            serviceId: ev.serviceId,
            serviceName: getServiceName(ev.serviceId),
            // pass any other props you want to modal
          },
        }))
      );
    } catch {
      setEvents([]);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [
    idToken,
    companyId,
    selectedEmployee,
    selectedService,
    services,
    employees,
  ]);

  // handlers
  const toDateTimeLocal = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const handleDateSelect = (info: DateSelectArg) => {
    if (!isOwner && selectedEmployee !== currentEmail)
      return alert("Yetki yok");
    setSelectedSpan({
      ...info,
      startStr: toDateTimeLocal(info.start),
      endStr: toDateTimeLocal(info.end),
    });
  };
  const handleDateClick = ({ date, view }: { date: Date; view: ViewApi }) =>
    handleDateSelect({
      start: date,
      end: new Date(date.getTime() + 3600000),
      allDay: false,
      view,
      jsEvent: undefined as any,
      startStr: "",
      endStr: "",
    });
  const handleCreate = () => {
    if (
      !selectedSpan ||
      !selectedPatient ||
      !selectedEmployee ||
      !selectedService
    )
      return alert("Eksik seçim");
    createAppointment(
      idToken!,
      companyId!,
      selectedPatient,
      selectedEmployee,
      selectedService,
      selectedSpan.startStr!,
      selectedSpan.endStr!
    )
      .then(() => {
        alert("Oluşturuldu");
        setSelectedSpan(null);
        fetchAppointments();
      })
      .catch((e) => alert(e.message));
  };
  const handleEventClick = (ci: EventClickArg) =>
    setModalEvent({
      id: ci.event.id,
      title: ci.event.title,
      start: ci.event.startStr,
      end: ci.event.endStr,
      extendedProps: ci.event.extendedProps,
    });
  const handleCancel = (id: string) =>
    deleteAppointment(idToken!, companyId!, id).then(() => {
      setModalEvent(null);
      fetchAppointments();
    });
  const handleEventDrop = (info: EventDropArg) =>
    updateAppointment(
      idToken!,
      companyId!,
      info.event.id,
      info.event.startStr,
      info.event.endStr
    )
      .then(fetchAppointments)
      .catch(() => info.revert());
  const handleUpdate = (id: string, changes: { start: string; end: string }) =>
    updateAppointment(
      idToken!,
      companyId!,
      id,
      changes.start,
      changes.end
    ).then(() => {
      setModalEvent(null);
      fetchAppointments();
    });

  const nav = (a: "prev" | "next" | "today") => {
    const api = calendarRef.current?.getApi();
    if (api)
      a === "prev" ? api.prev() : a === "next" ? api.next() : api.today();
  };
  const startHour = 8,
    endHour = 22,
    half = (endHour - startHour) / 2;
  const now = new Date(),
    scHour = Math.max(startHour, now.getHours() - half);
  const scrollTime = `${String(Math.floor(scHour)).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}:00`;

  const handleViewChange = (view: string) => {
    const api = calendarRef.current?.getApi();
    if (api) api.changeView(view);
  };
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="sticky top-0 bg-white shadow px-4 h-16 flex items-center">
        <button
          onClick={() =>
            document.getElementById("calendar-filter-btn")?.click()
          }
        >
          <FunnelIcon className="w-6 h-6 text-yellow-600" />
        </button>
        <h1 className="ml-4 text-xl font-bold text-yellow-900 flex-1">
          Randevu Takvimi
        </h1>
      </header>
      <ServiceAndEmployeeFilter
        employees={employees}
        selectedEmployee={selectedEmployee}
        onEmployeeChange={setSelectedEmployee}
        services={services}
        selectedService={selectedService}
        onServiceChange={setSelectedService}
        currentUserEmail={currentEmail}
        ownerEmail={ownerEmail}
      />
      {showAddPatient && (
        <AddPatient
          show
          onClose={() => setShowAddPatient(false)}
          idToken={idToken!}
          companyId={companyId!}
        />
      )}
      {modalEvent && (
        <AppointmentModal
          event={modalEvent!}
          services={services}
          employees={employees}
          onClose={() => setModalEvent(null)}
          onCancel={handleCancel}
          onUpdate={handleUpdate}
        />
      )}
      <NewAppointmentModal
        show={!!selectedSpan}
        onClose={() => setSelectedSpan(null)}
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
        setStartStr={(v) =>
          setSelectedSpan((s) => (s ? { ...s, startStr: v } : s))
        }
        endStr={selectedSpan?.endStr || ""}
        setEndStr={(v) => setSelectedSpan((s) => (s ? { ...s, endStr: v } : s))}
        onSubmit={handleCreate}
        onAddPatient={() => setShowAddPatient(true)}
      />
      <nav className="flex justify-between items-center px-2 py-3 max-w-3xl mx-auto">
        <div className="flex gap-2">
          <button
            onClick={() => nav("prev")}
            className="p-2 bg-gray-100 rounded"
          >
            <ChevronLeftIcon className="w-5 h-5 text-yellow-700" />
          </button>
          <button
            onClick={() => nav("today")}
            className="p-2 bg-gray-100 rounded"
          >
            Bugün
          </button>
          <button
            onClick={() => nav("next")}
            className="p-2 bg-gray-100 rounded"
          >
            <ChevronRightIcon className="w-5 h-5 text-yellow-700" />
          </button>
        </div>
        <div className="text-center flex-1 font-semibold text-yellow-900 truncate">
          {calendarDate}
        </div>
        <div className="flex gap-2">
          {["threeDay", "timeGridWeek", "dayGridMonth"].map((view) => (
            <button
              key={view}
              onClick={() => handleViewChange(view)}
              className={`px-2 py-1 rounded ${
                calendarView === view
                  ? "bg-yellow-700 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {view === "threeDay"
                ? "3 Gün"
                : view === "timeGridWeek"
                ? "Hafta"
                : "Ay"}
            </button>
          ))}
        </div>
      </nav>
      <main className="flex-1 flex flex-col items-center p-2 sm:p-4">
        <div className="w-full max-w-3xl bg-white rounded-t-3xl shadow flex-1 overflow-hidden">
          <FullCalendar
            ref={calendarRef}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              bootstrap5Plugin,
            ]}
            themeSystem="bootstrap5"
            initialView="threeDay"
            locale={trLocale}
            headerToolbar={false}
            allDaySlot={false}
            selectable
            selectMirror
            select={handleDateSelect}
            dateClick={handleDateClick}
            editable
            eventDrop={handleEventDrop}
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
            scrollTime={scrollTime}
            eventContent={(arg) => (
              <div className="flex flex-col p-1 text-white">
                {arg.event.extendedProps.serviceName && (
                  <span className="text-xs font-semibold bg-yellow-700 px-1 rounded">
                    {arg.event.extendedProps.serviceName}
                  </span>
                )}
                <span className="text-sm truncate">{arg.event.title}</span>
              </div>
            )}
          />
        </div>
      </main>
    </div>
  );
};

export default CalendarView;
