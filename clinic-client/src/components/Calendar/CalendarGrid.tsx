// src/components/Calendar/CalendarGrid.tsx
import React from "react";
import CalendarEventCard from "./CalendarEventCard";

interface CalendarEvent {
  id: string;
  start: string | Date;
  duration: number;
  color: string;
}

interface Props {
  gridDates: Date[];
  HOURS: number[];
  SLOTS: { hour: number; minute: number }[];
  events: CalendarEvent[];
  slotHeight: number;
  colWidth: number;
  handleSlotMouseDown: (d: Date, h: number, m: number) => void;
  handleSlotMouseEnter: (d: Date, h: number, m: number, btns: number) => void;
  handleSlotMouseUp: (d: Date, h: number, m: number) => void;
  handleEventClick: (evt: CalendarEvent) => void;
}

export const CalendarGrid: React.FC<Props> = ({
  gridDates,
  HOURS,
  SLOTS,
  events,
  slotHeight,
  colWidth,
  handleSlotMouseDown,
  handleSlotMouseEnter,
  handleSlotMouseUp,
  handleEventClick,
}) => {
  return (
    <div className="relative flex w-full h-full">
      <div className="w-12 border-r">
        {HOURS.map((h) => (
          <div key={h} className="h-10 border-b text-xs text-right pr-2">
            {h}:00
          </div>
        ))}
        {SLOTS.map((slot, rowIdx) =>
          gridDates.map((day, colIdx) => (
            <button
              key={`${rowIdx}-${colIdx}`}
              type="button"
              className="border border-gray-200 h-5 focus:outline-none"
              onMouseDown={() =>
                handleSlotMouseDown(day, slot.hour, slot.minute)
              }
              onMouseEnter={(e) =>
                handleSlotMouseEnter(day, slot.hour, slot.minute, e.buttons)
              }
              onMouseUp={() => handleSlotMouseUp(day, slot.hour, slot.minute)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleSlotMouseDown(day, slot.hour, slot.minute);
                }
              }}
              tabIndex={0}
              aria-label={`Slot at ${slot.hour}:${slot.minute
                .toString()
                .padStart(2, "0")} on ${day.toDateString()}`}
            />
          ))
        )}
        {events.map((evt) => {
          const eventDate = new Date(evt.start);
          const hours = eventDate.getHours();
          const minutes = eventDate.getMinutes();
          const top = (hours * 4 + Math.floor(minutes / 15)) * slotHeight;
          const dayIndex = gridDates.findIndex(
            (d) => d.toDateString() === eventDate.toDateString()
          );
          const left = dayIndex * colWidth;

          return (
            <button
              key={evt.id}
              type="button"
              className="absolute"
              style={{
                top,
                left,
                width: colWidth - 4,
                height: evt.duration * slotHeight,
              }}
              onClick={() => handleEventClick(evt)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleEventClick(evt);
                }
              }}
              tabIndex={0}
              aria-label={`Event at ${eventDate.getHours()}:${eventDate
                .getMinutes()
                .toString()
                .padStart(2, "0")} on ${eventDate.toDateString()}`}
            >
              <CalendarEventCard
                evt={{
                  ...evt,
                  end: new Date(
                    new Date(evt.start).getTime() + evt.duration * 60000
                  ),
                }}
                color={evt.color}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
