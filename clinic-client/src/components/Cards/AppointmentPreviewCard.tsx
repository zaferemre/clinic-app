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
      className={`h-full w-full rounded-xl flex flex-col justify-between px-3 py-3 shadow-sm bg-white border-l-4 cursor-pointer transition hover:shadow-md focus:ring-2 focus:ring-brand-main-100 outline-none`}
      style={{ borderColor }}
      tabIndex={0}
    >
      <div className="flex justify-between items-center">
        <div className="truncate font-semibold  text-[14px] leading-tight">
          {title}
        </div>
        {status && (
          <span className="text-[11px] font-bold uppercase tracking-wide">
            {status}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span
          className={`
          text-[11px] font-semibold capitalize
          px-2 py-0.5 rounded-full
          ${type === "group" ? "bg-gray-200 " : "bg-gray-100 "}
        `}
        >
          {type === "group" ? "Grup" : "Tek"}
        </span>
        <div className="truncate text-[12px] text-gray-700">{service}</div>
      </div>
      <div className="mt-2 text-[11px] flex justify-between text-gray-500">
        <span>
          {formatTime(start)} - {formatTime(end)}
        </span>
        {duration !== undefined && <span>{duration} dk</span>}
      </div>
    </div>
  );
};

export default AppointmentPreviewCard;
