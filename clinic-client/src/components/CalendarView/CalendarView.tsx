// src/components/CalendarView/CalendarView.tsx

import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import {
  DateSelectArg,
  EventClickArg,
  EventInput,
  ViewApi,
} from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";

import {
  getAppointments,
  createAppointment,
  deleteAppointment,
} from "../../api/appointmentApi.ts";
import { getPatients } from "../../api/patientApi.ts";
import { useAuth } from "../../contexts/AuthContext";
import AddPatient from "../AddPatient/AddPatient";
import { AppointmentModal } from "../AppointmentModal";
import {
  CalendarEmployee,
  CalendarEmployeeSelector,
} from "../CalendarEmployeeSelector/CalendarEmployeeSelector";

import { API_BASE } from "../../config/apiConfig.ts";

export const CalendarView: React.FC = () => {
  const { idToken, companyId } = useAuth();

  // FullCalendar events array
  const [events, setEvents] = useState<EventInput[]>([]);

  // Patients and workers data
  const [patients, setPatients] = useState<
    { _id: string; name: string; credit: number }[]
  >([]);
  const [workers, setWorkers] = useState<CalendarEmployee[]>([]);

  // For filtering / creating appointments
  const [selectedWorker, setSelectedWorker] = useState<string>("");
  const [selectedSpan, setSelectedSpan] = useState<DateSelectArg | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string>("");

  // Show/hide overlays
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [modalEvent, setModalEvent] = useState<EventInput | null>(null);

  // ─── 1) Fetch Patients ─────────────────────────────────────────────
  const fetchPatients = async () => {
    if (!idToken || !companyId) {
      setPatients([]);
      return;
    }
    try {
      const data = await getPatients(idToken, companyId);
      setPatients(
        data.map((p) => ({ _id: p._id, name: p.name, credit: p.credit }))
      );
    } catch (err) {
      console.error("Fetch patients error:", err);
      setPatients([]);
    }
  };

  useEffect(() => {
    if (idToken && companyId) fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idToken, companyId]);

  useEffect(() => {
    if (!showAddPatient) {
      fetchPatients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAddPatient]);

  // ─── 2) Fetch Workers via GET /company/:companyId/workers ─────────────────
  const fetchWorkers = async () => {
    if (!idToken || !companyId) {
      setWorkers([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/company/${companyId}/workers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (!res.ok) {
        throw new Error(`Sunucu hatası (status ${res.status})`);
      }
      const data = await res.json();
      // data: Array<{ email, name, pictureUrl, role }>
      type WorkerApiResponse = {
        email: string;
        name?: string;
        pictureUrl?: string;
        role?: string;
      };
      const mapped: CalendarEmployee[] = (Array.isArray(data) ? data : []).map(
        (w: WorkerApiResponse) => ({
          email: w.email,
          name: w.name ?? w.email,
          pictureUrl: w.pictureUrl ?? "",
        })
      );
      setWorkers(mapped);
    } catch (err) {
      console.error("Fetch workers error:", err);
      setWorkers([]);
    }
  };

  useEffect(() => {
    if (idToken && companyId) fetchWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idToken, companyId]);

  // ─── 3) Fetch Appointments & assign colors ────────────────────────────
  const fetchAppointments = async () => {
    if (!idToken || !companyId) return;
    try {
      type Appointment = {
        id: string;
        title: string;
        start: string;
        end: string;
        workerEmail?: string;
      };
      const data: Appointment[] = await getAppointments(idToken, companyId);

      // Filter by selectedWorker if set
      const filtered = data.filter((ev) => {
        if (!selectedWorker) return true;
        return ev.workerEmail === selectedWorker;
      });

      // Group by date “YYYY-MM-DD”
      const groupedByDate: Record<string, typeof data> = {};
      filtered.forEach((ev) => {
        const dateKey = ev.start.split("T")[0];
        if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
        groupedByDate[dateKey].push(ev);
      });

      // Pastel palette
      const palette = ["#34D399", "#93C5FD", "#FDBA74", "#F9A8D4", "#FCA5A5"];

      const now = new Date().getTime();
      const fcEvents: EventInput[] = [];
      Object.values(groupedByDate).forEach((evListOnDate) => {
        evListOnDate.forEach((ev, idx) => {
          const isPast = ev.end && new Date(ev.end).getTime() < now;
          const color = isPast ? "#9CA3AF" : palette[idx % palette.length];
          fcEvents.push({
            id: ev.id,
            title: ev.title,
            start: ev.start,
            end: ev.end,
            color,
          });
        });
      });

      setEvents(fcEvents);
    } catch (err) {
      console.error("Fetch appointments error:", err);
      setEvents([]);
    }
  };

  useEffect(() => {
    if (idToken && companyId) fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idToken, companyId, selectedWorker]);

  // ─── 4) When user drags a time‐range (“select”) ─────────────────────────
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedSpan(selectInfo);
  };

  // ─── 5) When user single‐clicks a slot (“dateClick”) ────────────────────
  const handleDateClick = (clickInfo: { date: Date; view: ViewApi }) => {
    const startDate = clickInfo.date;
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const pseudoSelect: DateSelectArg = {
      start: startDate,
      end: endDate,
      startStr: startDate.toISOString(),
      endStr: endDate.toISOString(),
      allDay: false,
      view: clickInfo.view,
      jsEvent: null,
    };
    setSelectedSpan(pseudoSelect);
  };

  // ─── 6) Create appointment when “Oluştur” clicked ───────────────────────
  const handleCreateAppointment = async () => {
    if (!selectedSpan || !selectedPatient || !selectedWorker) {
      alert("Lütfen bir hasta ve bir çalışan seçin.");
      return;
    }
    try {
      const { startStr, endStr } = selectedSpan;
      await createAppointment(
        idToken!,
        companyId!,
        selectedPatient,
        selectedWorker,
        startStr,
        endStr
      );
      await fetchAppointments();
      setSelectedSpan(null);
      setSelectedPatient("");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Randevu oluşturulamadı.";
      alert(msg);
    }
  };

  // ─── 7) Event click → open modal ───────────────────────────────────────
  const handleEventClick = (clickInfo: EventClickArg) => {
    setModalEvent({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
      color: clickInfo.event.backgroundColor,
    });
  };

  // ─── 8) Cancel appointment (called by modal) ───────────────────────────
  const handleCancelAppointment = async (appointmentId: string) => {
    await deleteAppointment(idToken!, companyId!, appointmentId);
    await fetchAppointments();
  };

  // ─── 9) Close “Yeni Hasta Ekle” overlay ────────────────────────────────
  const handleCloseAddPatient = () => {
    setShowAddPatient(false);
  };

  return (
    <div className="flex flex-col flex-1 bg-brand-gray-100">
      {/* ── Add Patient Overlay ── */}
      {showAddPatient && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/50">
          <div className="w-full max-w-md mx-4 mt-10 mb-10">
            <AddPatient companyId={companyId!} idToken={idToken!} />
            <button
              className="
                absolute top-2 right-2
                bg-white text-brand-gray-700
                hover:text-brand-black
                rounded-full p-1 shadow
              "
              onClick={handleCloseAddPatient}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* ── Appointment Modal ── */}
      {modalEvent && (
        <AppointmentModal
          event={modalEvent}
          onClose={() => setModalEvent(null)}
          onCancel={handleCancelAppointment}
        />
      )}

      {/* ── Worker Filter Bar ── */}
      <div className="mx-4 mt-4 mb-2 p-2 bg-white rounded-xl shadow flex items-center space-x-2">
        <label
          htmlFor="worker-select"
          className="font-medium text-sm text-brand-black"
        >
          Çalışan:
        </label>
        <CalendarEmployeeSelector
          workers={workers}
          selectedWorker={selectedWorker}
          onChange={(email) => setSelectedWorker(email)}
        />
      </div>

      {/* ── Appointment Creation Bar ── */}
      {selectedSpan && (
        <div className="mx-4 mb-2 p-4 bg-white rounded-xl shadow flex flex-col space-y-3">
          <h3 className="text-sm font-semibold text-brand-black">
            Randevu Oluştur
          </h3>

          {/* “Yeni Hasta Ekle” Button */}
          <button
            className="
              self-start mb-2
              bg-brand-blue-100 hover:bg-brand-blue-200
              text-brand-blue-500 px-3 py-1 rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-brand-blue-300
            "
            onClick={() => setShowAddPatient(true)}
          >
            Yeni Hasta Ekle
          </button>

          {/* Patient Dropdown */}
          <div className="flex items-center space-x-2 text-sm">
            <label
              htmlFor="patient-select"
              className="font-medium text-brand-black"
            >
              Hasta:
            </label>
            <select
              id="patient-select"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="
                flex-1 px-2 py-1
                border border-brand-gray-300
                rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-brand-green-300
              "
            >
              <option value="">Seçiniz</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (Kredi: {p.credit})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <label
              htmlFor="worker-select"
              className="font-medium text-brand-black"
            >
              Çalışan:
            </label>
            <CalendarEmployeeSelector
              workers={workers}
              selectedWorker={selectedWorker}
              onChange={(email) => setSelectedWorker(email)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={handleCreateAppointment}
              className="
                flex-1
                bg-brand-green-400 hover:bg-brand-green-500
                text-white rounded-lg
                px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-brand-green-300
              "
            >
              Oluştur
            </button>
            <button
              onClick={() => {
                setSelectedSpan(null);
                setSelectedPatient("");
              }}
              className="
                flex-1
                bg-brand-gray-300 hover:bg-brand-gray-400
                text-brand-black rounded-lg
                px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-brand-gray-200
              "
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* ── FullCalendar Container ── */}
      <div className="flex-1 mb-4 bg-white rounded-xl shadow overflow-hidden w-full">
        <div className="w-full overflow-x-auto">
          <style>
            {`
            /* Shrink FullCalendar text sizes */
            .fc .fc-toolbar-title {
              font-size: 0.75rem;
            }
            .fc .fc-button {
              font-size: 0.75rem;
            }
            .fc .fc-col-header-cell-cushion {
              font-size: 0.75rem;
            }
            .fc .fc-timegrid-slot-lane .fc-timegrid-slot-text {
              font-size: 0.625rem;
            }
            .fc .fc-daygrid-day-number {
              font-size: 0.75rem;
            }
            .fc .fc-event-title {
              font-size: 0.75rem;
            }
            /* Enable vertical scrolling inside FullCalendar on mobile */
            .fc .fc-scroller {
              overflow-y: auto !important;
              -webkit-overflow-scrolling: touch !important;
            }
            .fc .fc-daygrid-body,
            .fc .fc-timegrid-body {
              user-select: none;
            }

            `}
          </style>

          <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              bootstrap5Plugin,
            ]}
            themeSystem="bootstrap5"
            initialView="timeGridWeek"
            views={{
              dayGridMonth: {
                titleFormat: { year: "numeric", month: "long" },
              },
              timeGridWeek: {
                titleFormat: { month: "short", day: "numeric" },
              },
              timeGridDay: {
                titleFormat: {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                },
              },
            }}
            allDaySlot={false}
            editable={true}
            eventResizableFromStart={true}
            eventDurationEditable={true}
            selectable={true}
            selectMirror={true}
            select={handleDateSelect}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            events={events}
            eventDisplay="block"
            headerToolbar={{
              start: "prev,next today",
              center: "title",
              end: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            slotMinTime="08:00:00"
            slotMaxTime="22:00:00"
            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
            nowIndicator={true}
            height="auto"
          />
        </div>
      </div>
    </div>
  );
};
