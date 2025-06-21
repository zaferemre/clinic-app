// src/components/Calendar/CalendarHeader.tsx
import React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

interface Props {
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  calendarView: string;
  setCalendarView: (view: string) => void;
  VIEW_CONFIG: Record<string, { label: string; days: number }>;
  onFilterOpen: () => void;
}

export const CalendarHeader: React.FC<Props> = ({
  currentDate,
  setCurrentDate,
  calendarView,
  setCalendarView,
  VIEW_CONFIG,
  onFilterOpen,
}) => (
  <div className="flex items-center justify-between bg-white px-2 py-1 border-b sticky top-0 z-30">
    {/* Left controls */}
    <div className="flex items-center gap-1">
      <button onClick={onFilterOpen} aria-label="Filtrele">
        <FunnelIcon className="ml-2 h-7 text-brand-main" />
      </button>
      <button
        onClick={() => {
          const d = new Date(currentDate);
          const offset = VIEW_CONFIG[calendarView]?.days || 0;
          if (calendarView === "month") {
            d.setMonth(d.getMonth() - 1);
          } else {
            d.setDate(d.getDate() - offset);
          }
          setCurrentDate(new Date(d));
        }}
        aria-label="Geri"
        className="p-1 rounded hover:bg-gray-100 transition"
      >
        <ChevronLeftIcon className="w-5 h-5 text-brand-main" />
      </button>
      <button
        className="px-2 py-1 rounded text-sm font-semibold bg-[color:#FF8269] text-white whitespace-nowrap"
        onClick={() => setCurrentDate(new Date())}
      >
        Bugün
      </button>
      <button
        onClick={() => {
          const d = new Date(currentDate);
          const offset = VIEW_CONFIG[calendarView]?.days || 0;
          if (calendarView === "month") {
            d.setMonth(d.getMonth() + 1);
          } else {
            d.setDate(d.getDate() + offset);
          }
          setCurrentDate(new Date(d));
        }}
        aria-label="İleri"
        className="p-1 rounded hover:bg-gray-100 transition"
      >
        <ChevronRightIcon className="w-5 h-5 text-brand-main" />
      </button>
    </div>

    {/* View selector including Agenda */}
    <div className="flex items-center gap-1 overflow-x-auto">
      {Object.entries(VIEW_CONFIG).map(([key, cfg]) => (
        <button
          key={key}
          className={`px-2 py-1 text-sm font-medium rounded whitespace-nowrap transition duration-100
            ${
              calendarView === key
                ? "bg-brand-main text-white"
                : "bg-white border border-gray-200 text-brand-main"
            }`}
          onClick={() => setCalendarView(key)}
        >
          {cfg.label}
        </button>
      ))}
      <button
        className={`px-2 py-1 text-sm font-medium rounded whitespace-nowrap transition duration-100
          ${
            calendarView === "agenda"
              ? "bg-brand-main text-white"
              : "bg-white border border-gray-200 text-brand-main"
          }`}
        onClick={() => setCalendarView("agenda")}
      >
        Ajanda
      </button>
    </div>
  </div>
);

export default CalendarHeader;
