import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg, EventInput } from "@fullcalendar/core";
import { getAppointments } from "../../api/appointmentApi";
import { CalendarEvent } from "../../types/sharedTypes";
import { useAuth } from "../../contexts/AuthContext";

export const CalendarPreview: React.FC<{
  onEventClick?: (info: EventClickArg) => void;
}> = ({ onEventClick }) => {
  const { idToken, companyId } = useAuth();
  const [events, setEvents] = useState<EventInput[]>([]);

  useEffect(() => {
    const fetchToday = async () => {
      if (!idToken || !companyId) return;
      try {
        const data: CalendarEvent[] = await getAppointments(idToken, companyId);
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const todayStr = `${year}-${month}-${day}`;

        const todaysEvents = data.filter((ev) => ev.start.startsWith(todayStr));
        setEvents(
          todaysEvents.map((ev) => ({
            ...ev,
            title:
              ev.patientName && ev.serviceName
                ? `${ev.patientName} • ${ev.serviceName}`
                : ev.patientName
                ? ev.patientName
                : "Randevu",
            color: "#34D399",
          }))
        );
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      }
    };
    fetchToday();
  }, [idToken, companyId]);

  // Date/time helpers
  const pad = (n: number) => n.toString().padStart(2, "0");
  const now = new Date();
  const isoToday = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}`;
  const spanStart = 8,
    spanEnd = 22,
    halfSpan = (spanEnd - spanStart) / 2;
  const scrollHour = Math.max(spanStart, now.getHours() - halfSpan);
  const scrollTime = `${pad(Math.floor(scrollHour))}:${pad(
    now.getMinutes()
  )}:00`;

  return (
    <div className="bg-white rounded-xl shadow-md p-4  mb-4 flex justify-center">
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800">
            Bugünün Randevuları
          </h3>
          <span className="text-sm text-gray-500">{events.length} adet</span>
        </div>
        <div className="h-64 overflow-hidden">
          <style>{`
            .fc .fc-toolbar { display: none; }
            .fc .fc-now-indicator { background-color: red !important; }
            .fc .fc-timegrid-slot-lane .fc-timegrid-slot-text {
              color: #4B5563;
              font-size: 0.75rem;
            }
            .fc .fc-timegrid-event {
              background-color: #34D399 !important;
              border: none !important;
              color: #FFFFFF !important;
              font-size: 0.75rem;
              border-radius: 0.375rem;
            }
          `}</style>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridDay"
            initialDate={isoToday}
            allDaySlot={false}
            headerToolbar={false}
            height="100%"
            slotMinTime="08:00:00"
            slotMaxTime="22:00:00"
            events={events}
            eventClick={onEventClick}
            nowIndicator
            scrollTime={scrollTime}
            timeZone="local"
          />
        </div>
      </div>
    </div>
  );
};
