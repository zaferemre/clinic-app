import React from "react";
import type { CardAppointment, CardEmployee } from "../../types/sharedTypes";
import { AppointmentPreviewCard } from "../Cards/AppointmentPreviewCard";

interface UpcomingAppointmentsProps {
  appointments: CardAppointment[];
  user: { email: string; role: string };
  employees: CardEmployee[];
}

const PALETTE = [
  "#f3c0b1", // brand-main-200
  "#eea28d", // brand-main-300
  "#ea866e", // brand-main-400
  "#e2725b", // brand-main-500
  "#ce684f", // brand-main-600
  "#b65947", // brand-main-700
];

export const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({
  appointments,
  user,
  employees,
}) => {
  const isOwner = user.role === "owner";
  const apptsToShow = isOwner
    ? appointments
    : appointments.filter((a) => a.employeeEmail === user.email);

  const grouped: Record<string, CardAppointment[]> = {};
  apptsToShow.forEach((appt) => {
    const key = appt.employeeEmail || "unknown";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(appt);
  });

  const rows = isOwner
    ? Object.entries(grouped)
    : ([[user.email, grouped[user.email] || []]] as [
        string,
        CardAppointment[]
      ][]);

  if (apptsToShow.length === 0) {
    return (
      <div className="mb-4">
        <h3 className="text-lg font-bold text-brand-main-700 ">
          Günün Randevuları
        </h3>
        <div className="text-sm text-gray-400 text-center py-4 bg-brand-main-50 rounded-xl">
          Bugün için randevu yok.
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h3 className="text-lg font-bold text-black mb-2 ">Günün Randevuları</h3>
      {rows.map(([email, appts], idx) => {
        if (!appts.length) return null;
        const emp: CardEmployee =
          employees.find((e) => e.email === email) || appts[0].employee;
        const color = PALETTE[idx % PALETTE.length];

        return (
          <div key={email} className="mb-6">
            <div className="flex items-center gap-2 pl-2 mb-2">
              {emp.avatarUrl ? (
                <img
                  src={emp.avatarUrl}
                  alt={emp.name}
                  className="w-8 h-8 rounded-full border-2 border-brand-main-200  object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-brand-main-100 bg-brand-main-50 flex items-center justify-center font-bold text-brand-main-600 shadow">
                  {(emp.name || email).slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="font-semibold text-black">{emp.name}</span>
              <span className="ml-2 inline-block bg-brand-main-100 text-brand-main-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                {appts.length}
              </span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-1">
              {appts.map((appt) => (
                <div
                  key={appt.id}
                  className="min-w-[260px] max-w-[300px] flex-shrink-0"
                >
                  <AppointmentPreviewCard
                    borderColor={color}
                    title={appt.groupName || appt.patientName || ""}
                    type={appt.groupName ? "group" : "individual"}
                    service={appt.serviceName}
                    start={appt.start}
                    end={appt.end}
                    status={appt.status}
                    duration={appt.serviceDuration}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UpcomingAppointments;
