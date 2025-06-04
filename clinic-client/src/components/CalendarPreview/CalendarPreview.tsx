// src/components/CalendarPreview.tsx
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core"; // Import correct type for event click

interface CalendarPreviewProps {
  idToken: string;
  clinicId: string;
  onEventClick?: (info: EventClickArg) => void; // optional callback when user clicks a slot/event
}

export const CalendarPreview: React.FC<CalendarPreviewProps> = ({
  idToken,
  clinicId,
  onEventClick,
}) => {
  interface CalendarEvent {
    title: string;
    start: string;
    end?: string;
    color?: string;
    [key: string]: unknown;
  }

  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    // Option A: Fetch “appointments” from your backend for “today” only.
    // For demonstration, let’s fetch all and filter in UI—but ideally your API accepts a “date” param.

    const apiUrl = import.meta.env.VITE_RAILWAY_LINK || "http://localhost:3001";
    fetch(`${apiUrl}/clinic/${clinicId}/appointments`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    })
      .then((res) => res.json())
      .then((data: CalendarEvent[]) => {
        // Assume data is an array of { title, start, end, color }
        // Filter down to events where start is “today”
        const todayStr = new Date().toISOString().split("T")[0]; // “YYYY-MM-DD”
        const todaysEvents = data.filter((ev) =>
          ev.start?.startsWith(todayStr)
        );
        setEvents(todaysEvents);
      })
      .catch((err) => console.error("Failed to fetch appointments:", err));
  }, [clinicId, idToken]);

  // Today’s date in YYYY-MM-DD format for initialDate:
  const today = new Date();
  const isoToday = today.toISOString().split("T")[0];

  return (
    <div className="bg-white shadow rounded-md p-2 overflow-hidden">
      <div className="h-60">
        {/* fixed height so it doesn’t overflow */}
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
