// src/components/CalendarPreview/CalendarPreview.tsx

import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";

import { getAppointments } from "../../api/appointmentApi";
import { CalendarEvent } from "../../types/sharedTypes";
import { useAuth } from "../../contexts/AuthContext";

export const CalendarPreview: React.FC<{
  onEventClick?: (info: EventClickArg) => void;
}> = ({ onEventClick }) => {
  const { idToken, companyId } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const fetchToday = async () => {
      if (!idToken || !companyId) return;
      try {
        const data: CalendarEvent[] = await getAppointments(idToken, companyId);
        // Filter down to events whose start is “today” (local date)
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const todayStr = `${year}-${month}-${day}`;

        const todaysEvents = data.filter((ev) => ev.start.startsWith(todayStr));

        const fcEvents = todaysEvents.map((ev) => ({
          id: ev.id, // Include the id property
          title: ev.title,
          start: ev.start,
          end: ev.end,
          color: "#34D399", // brand-green-400
        }));
        setEvents(fcEvents);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      }
    };

    fetchToday();
  }, [companyId, idToken]);

  // Derive an ISO “YYYY-MM-DD” for initialDate
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const isoToday = `${year}-${month}-${day}`;

  return (
    <div className="bg-white rounded-xl shadow p-2 overflow-hidden mx-4 mb-4">
      {/* Force a fixed height so it doesn’t overflow the card */}
      <div className="h-60">
        <style>
          {`
            /* Hide default FullCalendar toolbar for preview */
            .fc .fc-toolbar { display: none; }

            /* For the day view in the preview: apply brand styling */
            .fc .fc-timegrid-slot-lane .fc-timegrid-slot-text {
              color: #4B5563; /* brand-gray-700 */
              font-size: 0.75rem;
            }
            .fc .fc-timegrid-event {
              background-color: #34D399 !important; /* brand-green-400 */
              border: none !important;
              color: #FFFFFF !important;
              font-size: 0.75rem;
              border-radius: 0.375rem;
            }
          `}
        </style>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridDay"
          slotMinTime="08:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          headerToolbar={false}
          height="100%"
          initialDate={isoToday}
          events={events}
          eventClick={(info) => {
            if (onEventClick) onEventClick(info);
          }}
        />
      </div>
    </div>
  );
};
