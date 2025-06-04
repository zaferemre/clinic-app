// src/components/CalendarView.tsx
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import { DateSelectArg, EventClickArg, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const apiUrl = import.meta.env.VITE_RAILWAY_LINK || "http://localhost:3001";

interface PatientOption {
  _id: string;
  name: string;
  credit: number;
}

interface CalendarViewProps {
  idToken: string;
  clinicId: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  idToken,
  clinicId,
}) => {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [view, setView] = useState<"timeGridWeek" | "timeGridDay">(
    "timeGridWeek"
  );
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedSpan, setSelectedSpan] = useState<DateSelectArg | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string>("");

  // 1) Fetch appointments
  const fetchAppointments = async () => {
    if (!idToken || !clinicId) return;
    try {
      const res = await fetch(`${apiUrl}/clinic/${clinicId}/appointments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (!res.ok) throw new Error("Randevular alınamadı");
      const data: EventInput[] = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Fetch appointments error:", err);
      setEvents([]);
    }
  };

  // 2) Fetch patients
  const fetchPatients = async () => {
    if (!idToken || !clinicId) {
      setPatients([]);
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/clinic/${clinicId}/patients`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (!res.ok) throw new Error("Hastalar alınamadı");
      const data: PatientOption[] = await res.json();
      setPatients(data);
    } catch (err) {
      console.error("Fetch patients error:", err);
      setPatients([]);
    }
  };

  useEffect(() => {
    if (idToken && clinicId) {
      fetchAppointments();
      fetchPatients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idToken, clinicId]);

  // 3) Responsive view (week vs day)
  useEffect(() => {
    const handleResize = () => {
      setView(window.innerWidth < 640 ? "timeGridDay" : "timeGridWeek");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 4) User selects a time slot
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedSpan(selectInfo);
  };

  // 5) Create appointment
  const handleCreateAppointment = async () => {
    if (!selectedSpan || !selectedPatient) {
      alert("Lütfen bir hasta seçin.");
      return;
    }
    try {
      const { startStr, endStr } = selectedSpan;
      const res = await fetch(`${apiUrl}/clinic/${clinicId}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          patientId: selectedPatient,
          start: startStr,
          end: endStr,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Randevu oluşturulamadı.");
      } else {
        fetchAppointments();
        setSelectedSpan(null);
        setSelectedPatient("");
      }
    } catch (err) {
      console.error("Create appointment error:", err);
      alert("Sunucu hatası.");
    }
  };

  // 6) Mark appointment as done
  const handleEventClick = async (clickInfo: EventClickArg) => {
    if (
      window.confirm(
        `Bu randevuyu tamamlandı olarak işaretlemek istiyor musunuz?\n(${clickInfo.event.title})`
      )
    ) {
      try {
        const apptId = clickInfo.event.id;
        const res = await fetch(
          `${apiUrl}/clinic/${clinicId}/appointments/${apptId}/complete`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        if (!res.ok) {
          const data = await res.json();
          alert(data.error || "İşaretlenemedi.");
        } else {
          fetchAppointments();
        }
      } catch (err) {
        console.error("Complete appointment error:", err);
        alert("Sunucu hatası.");
      }
    }
  };

  return (
    <>
      {/*  — Thumb‐sized CSS override to shrink FullCalendar’s toolbar — */}
      <style>
        {`
        /* Make the header (toolbar) text/icons smaller */
        .fc .fc-toolbar-title {
          font-size: 1rem !important;
          line-height: 1.2 !important;
        }
        .fc .fc-button {
          font-size: 0.75rem !important;
          padding: 0.25rem 0.5rem !important;
        }
        .fc .fc-col-header-cell-cushion {
          font-size: 0.75rem !important;
        }
        .fc .fc-timegrid-slot-lane .fc-timegrid-slot-text {
          font-size: 0.75rem !important;
        }
        `}
      </style>

      <div className="flex flex-col flex-1 bg-brand-gray-100">
        {/* Inline form (only when a slot is selected) */}
        {selectedSpan && (
          <div className="mb-2 p-2 bg-white rounded-lg shadow">
            <h3 className="text-sm font-semibold text-brand-black mb-1">
              Randevu Oluştur
            </h3>

            <div className="flex items-center mb-2 space-x-2 text-sm">
              <label className="font-medium text-brand-black">Hasta:</label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="flex-1 px-2 py-1 border border-brand-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-green-300"
              >
                <option value="">Seçiniz</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (Kredi: {p.credit})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleCreateAppointment}
                className="flex-1 bg-brand-green-400 hover:bg-brand-green-500 text-white rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green-300"
              >
                Oluştur
              </button>
              <button
                onClick={() => {
                  setSelectedSpan(null);
                  setSelectedPatient("");
                }}
                className="flex-1 bg-brand-gray-300 hover:bg-brand-gray-400 text-brand-black rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gray-200"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {/* FullCalendar Container */}
        <div className="flex-1 overflow-auto bg-white rounded-lg shadow">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={view}
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
            editable={false}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            events={events}
            eventDisplay="auto"
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
    </>
  );
};
