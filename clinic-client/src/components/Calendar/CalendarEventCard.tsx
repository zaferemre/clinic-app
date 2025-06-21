// src/components/Calendar/CalendarEventCard.tsx
import React from "react";

interface Props {
  evt: {
    patientName?: string;
    groupName?: string;
    serviceName?: string;
    start: string | Date;
    end: string | Date;
  };
  color: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const CalendarEventCard: React.FC<Props> = ({ evt, color, style, onClick }) => (
  <button
    type="button"
    className="rounded-xl p-2 shadow-md cursor-pointer select-none"
    style={{ backgroundColor: color, color: "white", ...style }}
    onClick={onClick}
  >
    <div className="truncate font-semibold">
      {evt.patientName ?? evt.groupName ?? "Etkinlik"}
    </div>
    <div className="text-xs truncate">{evt.serviceName}</div>
    <div className="text-xs">
      {new Date(evt.start).toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </div>
  </button>
);

export default CalendarEventCard;
