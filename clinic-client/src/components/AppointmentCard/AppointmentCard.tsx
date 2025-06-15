import React from "react";

export interface Employee {
  name: string;
  avatarUrl?: string;
  role?: string;
}

export interface AppointmentCardProps {
  id: string;
  patientName: string;
  serviceName: string;
  serviceDuration?: number;
  employee: Employee;
  start: string;
  end: string;
  status: "scheduled" | "done" | "cancelled" | string;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return isNaN(d.valueOf())
    ? "—"
    : d.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      });
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Planlı",
  done: "Tamamlandı",
  cancelled: "İptal",
};
const STATUS_COLORS: Record<string, string> = {
  scheduled: "text-brand-main bg-brand-main/10",
  done: "text-brand-green bg-brand-green/10",
  cancelled: "text-brand-red bg-brand-red/10",
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  patientName,
  serviceName,
  serviceDuration,
  employee,
  start,
  end,
  status,
}) => {
  const timeRange = `${formatTime(start)} – ${formatTime(end)}`;
  const badgeStyle = STATUS_COLORS[status] || "text-gray-500 bg-gray-100";
  const statusLabel = STATUS_LABELS[status] || status;

  return (
    <div
      className="flex items-center gap-3 bg-white shadow-md rounded-xl px-3 py-2 border-l-2 border-l-brand-main hover:shadow-md transition-all cursor-pointer"
      style={{ minHeight: 58, maxWidth: 320 }}
    >
      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="text-base font-medium text-brand-main truncate leading-tight">
          {patientName}
        </span>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>{serviceName}</span>
          {serviceDuration && (
            <>
              <span>•</span>
              <span>{serviceDuration} dk</span>
            </>
          )}
        </div>
        <span className="text-xs text-gray-400 truncate">
          {employee.name}
          {employee.role && (
            <>
              <span className="mx-1">•</span>
              <span>{employee.role}</span>
            </>
          )}
        </span>
      </div>

      {/* Time & Status */}
      <div className="flex flex-col items-end ml-2">
        <span className="font-semibold text-sm text-black leading-tight">
          {timeRange}
        </span>
        <span
          className={`mt-1 px-2 py-0.5 rounded text-xs font-semibold ${badgeStyle}`}
        >
          {statusLabel}
        </span>
      </div>
    </div>
  );
};
