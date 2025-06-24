import React from "react";
import type { CardAppointment, CardEmployee } from "../../types/sharedTypes";
import { AppointmentPreviewCard } from "../Cards/AppointmentPreviewCard";
import { isElevatedRole } from "../../utils/userRole";

interface UpcomingAppointmentsProps {
  appointments: CardAppointment[];
  user: { userId: string; role?: string };
  employees: CardEmployee[];
}

const PALETTE = [
  "#f3c0b1",
  "#eea28d",
  "#ea866e",
  "#e2725b",
  "#ce684f",
  "#b65947",
];

export const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({
  appointments,
  user,
  employees,
}) => {
  const isOwnerOrAdmin = isElevatedRole(user.role);
  const apptsToShow = isOwnerOrAdmin
    ? appointments
    : appointments.filter((a) => a.employeeId === user.userId);

  // Group by employeeId
  const grouped: Record<string, CardAppointment[]> = {};
  apptsToShow.forEach((appt) => {
    grouped[appt.employeeId] = grouped[appt.employeeId] || [];
    grouped[appt.employeeId].push(appt);
  });

  const rows: [string, CardAppointment[]][] = isOwnerOrAdmin
    ? (Object.entries(grouped) as [string, CardAppointment[]][])
    : [[user.userId, grouped[user.userId] || []]];

  if (apptsToShow.length === 0) {
    return (
      <div className="mb-4">
        <h3 className="text-lg font-bold text-brand-main-700">
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
      <h3 className="text-lg font-bold text-black mb-2">Günün Randevuları</h3>
      {rows.map(([empId, appts], idx) => {
        if (appts.length === 0) return null;

        // Look up name/avatar by userId
        const emp = employees.find((e) => e.userId === empId);
        const name = emp?.name ?? "empId";
        const avatar = emp?.avatarUrl || "";
        const color = PALETTE[idx % PALETTE.length];

        return (
          <div key={empId} className="mb-6">
            <div className="flex items-center gap-2 pl-2 mb-2">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-8 h-8 rounded-full border-2 border-brand-main-200 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-brand-main-100 bg-brand-main-50 flex items-center justify-center font-bold text-brand-main-600 shadow">
                  {name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="font-semibold text-black">{name}</span>
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
                    service={appt.serviceName || ""}
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
