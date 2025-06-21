// src/components/Cards/AppointmentPreviewCard.tsx
import React from "react";

export interface AppointmentPreviewCardProps {
  borderColor: string;
  title: string; // patient or group name
  type: "individual" | "group";
  service: string;
  start: string;
  end: string;
  status?: string;
  duration?: number;
}

export const AppointmentPreviewCard: React.FC<AppointmentPreviewCardProps> = ({
  borderColor,
  title,
  type,
  service,
  start,
  end,
  status,
  duration,
}) => {
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div
      className={`h-full w-full rounded-lg flex flex-col justify-between px-3 py-2 shadow-sm bg-white border-l-2 cursor-pointer transition hover:shadow-md`}
      style={{ borderColor }}
      tabIndex={0}
    >
      <div className="flex justify-between items-center">
        <div className="truncate font-semibold text-black text-[13px] leading-tight">
          {title}
        </div>
        {status && (
          <span className="text-[10px] font-medium text-gray-600 uppercase">
            {status}
          </span>
        )}
      </div>
      <div className="mt-1 flex items-center gap-1">
        <span className="text-[10px] font-semibold capitalize text-white bg-gray-500 rounded-full px-2">
          {type === "group" ? "Grup" : "Tek"}
        </span>
        <div className="truncate text-[11px] text-gray-700">{service}</div>
      </div>
      <div className="mt-1 text-[10px] flex justify-between text-gray-600">
        <span>
          {formatTime(start)} - {formatTime(end)}
        </span>
        {duration !== undefined && <span>{duration} dk</span>}
      </div>
    </div>
  );
};

export default AppointmentPreviewCard;
