// src/components/Cards/AppointmentPreviewCard.tsx
import React from "react";

export interface AppointmentPreviewCardProps {
  color: string;
  patient: string;
  service: string;
  start: Date;
  end: Date;
}

export const AppointmentPreviewCard: React.FC<AppointmentPreviewCardProps> = ({
  color,
  patient,
}) => {
  return (
    <div
      className="h-full w-full rounded-lg flex flex-col justify-between px-2 py-1 shadow border border-white hover:border-brand-main transition text-[12px] cursor-pointer"
      style={{
        background: color,
        color: "#fff",
        minHeight: 30,
        boxSizing: "border-box",
      }}
      tabIndex={0}
    >
      <div>
        <span className="font-bold text-[13px] leading-tight truncate">
          {patient}
        </span>
      </div>
    </div>
  );
};
