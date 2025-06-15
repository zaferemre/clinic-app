import React from "react";
import { AppointmentCard } from "../AppointmentCard/AppointmentCard";

export interface EmployeeCard {
  email: string;
  name: string;
  avatarUrl?: string;
  role?: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  serviceName: string;
  serviceDuration?: number;
  employee: EmployeeCard;
  employeeEmail: string;
  start: string;
  end: string;
  status: string;
}

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
  user: { email: string; role: string };
  employees: EmployeeCard[];
}

export const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({
  appointments,
  user,
  employees,
}) => {
  const isOwner = user.role === "owner";

  // Filter for this user's appointments if not owner
  const apptsToShow: Appointment[] = isOwner
    ? appointments
    : appointments.filter((a) => a.employeeEmail === user.email);

  // Group by employeeEmail
  const grouped: Record<string, Appointment[]> = {};
  apptsToShow.forEach((appt) => {
    const key = appt.employeeEmail || "unknown";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(appt);
  });

  // Force the correct tuple type so TS knows
  const rowsToShow: [string, Appointment[]][] = isOwner
    ? (Object.entries(grouped) as [string, Appointment[]][])
    : [[user.email, grouped[user.email] ?? []]];

  if (apptsToShow.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-bold text-brand-main mb-2">
          Günün Randevuları
        </h3>
        <div className="text-sm text-gray-400">Bugün için randevu yok.</div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-brand-main mb-2">
        Günün Randevuları
      </h3>

      {rowsToShow.map(([email, appts]: [string, Appointment[]]) => {
        if (!appts.length) return null;
        // Now TS knows appts is Appointment[]
        const emp: EmployeeCard =
          employees.find((e) => e.email === email) || appts[0].employee;

        return (
          <div key={email} className="mb-6">
            <div className="flex items-center mb-2 gap-2 pl-2">
              {emp.avatarUrl ? (
                <img
                  src={emp.avatarUrl}
                  alt={emp.name}
                  className="w-7 h-7 rounded-full border border-brand-main object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-200 border border-brand-main flex items-center justify-center font-bold text-brand-main">
                  {emp.name.slice(0, 2).toUpperCase() || "?"}
                </div>
              )}
              <span className="font-semibold text-brand-main">
                {emp.name || email}
              </span>
              {emp.role && (
                <span className="ml-2 text-xs text-gray-400">{emp.role}</span>
              )}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {appts.map((appt: Appointment, idx: number) => (
                <div
                  key={appt.id || `appt-${email}-${idx}`}
                  className="min-w-[260px] max-w-[300px] flex-shrink-0"
                >
                  <AppointmentCard {...appt} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
