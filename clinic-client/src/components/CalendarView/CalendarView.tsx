// src/components/CalendarView/CalendarView.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import {
  DateSelectArg,
  EventClickArg,
  EventInput,
  ViewApi,
  EventDropArg,
  DatesSetArg,
} from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import trLocale from "@fullcalendar/core/locales/tr";
import {
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

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
  const currentEmail = user?.email ?? "";

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

  const calendarRef = useRef<FullCalendar | null>(null);
  const [calendarDate, setCalendarDate] = useState<string>("");
  const [calendarView, setCalendarView] = useState<string>("threeDay");

  const isOwner = currentEmail === ownerEmail;

  // format Date → "YYYY-MM-DDTHH:mm"
  const toDateTimeLocal = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  // Update label when calendar changes
  const handleDatesSet = (arg: DatesSetArg) => {
    setCalendarDate(arg.view.title);
    setCalendarView(arg.view.type);
  };

  // Switch view
  const handleViewChange = (view: string) => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.changeView(view);
    }
  };

  // Prev/Next navigation
  const handleNav = (action: "prev" | "next" | "today") => {
    const api = calendarRef.current?.getApi();
    if (api) {
      if (action === "prev") api.prev();
      else if (action === "next") api.next();
      else if (action === "today") api.today();
    }
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
        setOwnerEmail(c.ownerEmail ?? "");
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
          list.map((p) => ({
            _id: p._id,
            name: p.name,
            credit: p.credit,
          }))
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
  const fetchAppointments = useCallback(async () => {
    if (!idToken || !companyId) return;
    try {
      const data = await getAppointments(idToken, companyId);

      const filtered = data.filter((ev: any) => {
        const matchEmp = selectedEmployee
          ? ev.employeeEmail === selectedEmployee
          : true;
        const matchSvc = selectedService
          ? ev.serviceId === selectedService
          : true;
        return matchEmp && matchSvc;
      });

      const palette = ["#34D399", "#93C5FD", "#FDBA74", "#F9A8D4", "#FCA5A5"];
      const now = Date.now();
      setEvents(
        filtered.map((ev: any, idx: number) => ({
          id: ev.id,
          title: ev.title ?? "Randevu",
          start: ev.start,
          end: ev.end,
          color:
            now > new Date(ev.end).getTime()
              ? "#9CA3AF"
              : palette[idx % palette.length],
          // Only add extendedProps if you need them for modals, etc.
          extendedProps: {
            employeeEmail: ev.employeeEmail ?? "",
            serviceId: ev.serviceId ?? "",
          },
        }))
      );
    } catch {
      setEvents([]);
    }
  }, [idToken, companyId, selectedEmployee, selectedService]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Creation handlers
  const handleDateSelect = (info: DateSelectArg) => {
    if (!isOwner && selectedEmployee !== currentEmail) {
      alert("Sadece kendi programınızı düzenleyebilirsiniz.");
      return;
    }
    const startStr = toDateTimeLocal(info.start);
    const endStr = toDateTimeLocal(info.end);
    setSelectedSpan({ ...info, startStr, endStr });
  };

  const handleDateClick = (ci: { date: Date; view: ViewApi }) =>
    handleDateSelect({
      start: ci.date,
      end: new Date(ci.date.getTime() + 3600_000),
      allDay: false,
      view: ci.view,
      jsEvent: undefined as unknown as MouseEvent,
      startStr: "",
      endStr: "",
    });

  const handleCreate = async () => {
    if (
      !selectedSpan ||
      !selectedPatient ||
      !selectedEmployee ||
      !selectedService
    ) {
      alert("Lütfen müşteri, çalışan ve hizmet seçin.");
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

  // Event click / cancel
  const handleEventClick = (ci: EventClickArg) => {
    // Use nullish coalescing for safety
    const ext = ci.event.extendedProps as {
      employeeEmail?: string;
      serviceId?: string;
    };
    const evEmail = ext?.employeeEmail ?? "";
    const svcId = ext?.serviceId ?? "";

    if (!isOwner && evEmail !== currentEmail) {
      alert("Sadece kendi randevularınızı düzenleyebilirsiniz.");
      return;
    }

    const svcName = services.find((s) => s._id === svcId)?.serviceName ?? "";

    setModalEvent({
      id: ci.event.id,
      title: ci.event.title ?? "",
      start: ci.event.startStr,
      end: ci.event.endStr,
      color: ci.event.backgroundColor,
      extendedProps: {
        employeeEmail: evEmail,
        serviceId: svcId,
        serviceName: svcName,
      },
    });
  };

  const handleCancel = async (id: string) => {
    await deleteAppointment(idToken!, companyId!, id);
    setModalEvent(null);
    window.dispatchEvent(new Event("refresh"));
  };

  // Drag & drop update
  const handleEventDrop = async (changeInfo: EventDropArg) => {
    const id = changeInfo.event.id;
    const newStart = changeInfo.event.startStr;
    const newEnd = changeInfo.event.endStr;
    const evEmail =
      (changeInfo.event.extendedProps as any)?.employeeEmail ?? "";

    if (!isOwner && evEmail !== currentEmail) {
      alert("Sadece kendi randevularınızı taşıyabilirsiniz.");
      changeInfo.revert();
      return;
    }

    try {
      await updateAppointment(idToken!, companyId!, id, newStart, newEnd);
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (
    id: string,
    changes: { start: string; end: string; serviceId?: string }
  ) => {
    try {
      await updateAppointment(
        idToken!,
        companyId!,
        id,
        changes.start,
        changes.end
      );
      setModalEvent(null);
      fetchAppointments();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* HEADER */}
      <header className="sticky top-0 left-0 z-30 bg-white shadow-sm flex items-center px-4 h-16 sm:h-20">
        <button
          className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition"
          onClick={() => {
            const openFilter = document.getElementById("calendar-filter-btn");
            if (openFilter) (openFilter as HTMLButtonElement).click();
          }}
          aria-label="Filtreleri Aç"
        >
          <FunnelIcon className="w-6 h-6 text-yellow-600" />
        </button>
        <h1 className="ml-4 text-xl sm:text-2xl font-bold text-yellow-900 flex-1">
          Randevu Takvimi
        </h1>
      </header>

      {/* Filter Sidebar */}
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

      {/* MODALS: Add Patient, Appointment Modal, New Appointment */}
      {showAddPatient && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center">
          <AddPatient
            companyId={companyId!}
            idToken={idToken!}
            show={showAddPatient}
            onClose={() => setShowAddPatient(false)}
          />
          <button
            className="absolute top-4 right-4 text-white text-3xl"
            onClick={() => setShowAddPatient(false)}
          >
            ×
          </button>
        </div>
      )}

      {modalEvent && (
        <AppointmentModal
          event={modalEvent}
          services={services}
          employees={employees}
          onClose={() => setModalEvent(null)}
          onCancel={handleCancel}
          onUpdate={handleUpdate}
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
        startStr={selectedSpan?.startStr ?? ""}
        setStartStr={(val) => {
          if (selectedSpan) setSelectedSpan({ ...selectedSpan, startStr: val });
        }}
        endStr={selectedSpan?.endStr ?? ""}
        setEndStr={(val) => {
          if (selectedSpan) setSelectedSpan({ ...selectedSpan, endStr: val });
        }}
        onSubmit={handleCreate}
        onAddPatient={() => setShowAddPatient(true)}
      />

      {/* NAVIGATION BAR */}
      <nav className="w-full max-w-3xl mx-auto px-2 pt-3 pb-2 flex items-center justify-between gap-2 bg-transparent">
        <div className="flex items-center gap-1">
          <button
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            onClick={() => handleNav("prev")}
            aria-label="Önceki"
          >
            <ChevronLeftIcon className="w-5 h-5 text-yellow-700" />
          </button>
          <button
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            onClick={() => handleNav("today")}
          >
            Bugün
          </button>
          <button
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            onClick={() => handleNav("next")}
            aria-label="Sonraki"
          >
            <ChevronRightIcon className="w-5 h-5 text-yellow-700" />
          </button>
        </div>
        <div className="font-semibold text-yellow-900 truncate text-base sm:text-lg flex-1 text-center">
          {calendarDate}
        </div>
        <div className="flex gap-1">
          <button
            className={`px-2 py-1 rounded-md text-sm font-medium ${
              calendarView === "threeDay"
                ? "bg-yellow-700 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => handleViewChange("threeDay")}
          >
            3 Gün
          </button>
          <button
            className={`px-2 py-1 rounded-md text-sm font-medium ${
              calendarView === "timeGridWeek"
                ? "bg-yellow-700 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => handleViewChange("timeGridWeek")}
          >
            Hafta
          </button>
          <button
            className={`px-2 py-1 rounded-md text-sm font-medium ${
              calendarView === "dayGridMonth"
                ? "bg-yellow-700 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => handleViewChange("dayGridMonth")}
          >
            Ay
          </button>
        </div>
      </nav>

      {/* CALENDAR */}
      <main className="flex-1 flex flex-col items-center px-0 py-2 sm:px-4 sm:py-4">
        <div className="w-full max-w-3xl bg-white rounded-t-3xl sm:rounded-2xl shadow-md sm:mt-2 flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
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
              headerToolbar={false} // Custom header instead!
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
              height="auto"
              contentHeight="auto"
              datesSet={handleDatesSet}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
