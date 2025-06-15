import { useEffect, useState } from "react";
import { getAppointments } from "../api/appointmentApi";
import { getPatients } from "../api/patientApi";
import { getEmployees } from "../api/employeeApi";
import { API_BASE } from "../config/apiConfig";
import type {
  Patient,
  EmployeeInfo,
  ServiceInfo,
  Appointment as RawFCEvent,
} from "../types/sharedTypes";

export interface CardEmployee {
  email: string;
  name: string;
  avatarUrl?: string;
  role?: string;
}

export interface CardAppointment {
  id: string;
  patientName: string;
  serviceName: string;
  serviceDuration?: number;
  employee: CardEmployee;
  employeeEmail: string;
  extendedProps?: {
    patientId?: string;
    employeeEmail?: string;
    serviceId?: string;
  };
  start: string;
  end: string;
  status: string;
}

// Extract string from ObjectId wrapper or plain string
function extractId(val: any): string | undefined {
  if (!val) return undefined;
  if (typeof val === "string") return val;
  if (typeof val === "object" && (val.$oid || val.oid))
    return val.$oid ?? val.oid;
  return undefined;
}

// Extract date string from ISO or Mongo wrapper
function extractDate(val: any): string | undefined {
  if (!val) return undefined;
  if (typeof val === "string") return val;
  if (typeof val === "object" && (val.$date || val.date))
    return val.$date ?? val.date;
  return undefined;
}

// Fetch services exactly as in CalendarView
async function fetchServices(idToken: string, companyId: string) {
  const res = await fetch(`${API_BASE}/company/${companyId}/services`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch services");
  return (await res.json()) as ServiceInfo[];
}

export function useTodaysAppointments(idToken: string, companyId: string) {
  const [appointments, setAppointments] = useState<CardAppointment[]>([]);
  const [employees, setEmployees] = useState<CardEmployee[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!idToken || !companyId) {
        setAppointments([]);
        setEmployees([]);
        return;
      }

      try {
        // ← cast to unknown first, then to RawFCEvent[]
        const rawEvents = (await getAppointments(
          idToken,
          companyId
        )) as unknown as RawFCEvent[];

        const [patients, employeeList, services] = await Promise.all([
          getPatients(idToken, companyId) as Promise<Patient[]>,
          getEmployees(idToken, companyId) as Promise<EmployeeInfo[]>,
          fetchServices(idToken, companyId),
        ]);

        const patientsById: Record<string, Patient> = Object.fromEntries(
          patients.map((p) => [extractId(p._id) ?? "", p])
        );

        const employeesByEmail: Record<string, CardEmployee> = {};
        const employeeCards: CardEmployee[] = employeeList.map((e) => {
          const card: CardEmployee = {
            email: e.email ?? "",
            name: e.name ?? "Çalışan",
            avatarUrl: e.pictureUrl,
            role: e.role ?? "",
          };
          employeesByEmail[card.email] = card;
          return card;
        });

        const servicesById: Record<string, ServiceInfo> = Object.fromEntries(
          services.map((s) => [extractId(s._id) ?? "", s])
        );

        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, "0");
        const d = String(today.getDate()).padStart(2, "0");
        const todayStr = `${y}-${m}-${d}`;

        const cards: CardAppointment[] = rawEvents
          .filter((ev) => extractDate(ev.start)?.startsWith(todayStr))
          .map((ev, idx) => {
            const id = ev._id || `appt-${idx}`;
            const ext = ev.extendedProps || {};
            const patientId = ext.patientId;
            const serviceId = ext.serviceId;
            const employeeEmail = ext.employeeEmail ?? "";

            const pat = patientsById[patientId ?? ""] ?? {};
            const patientName = pat.name ?? "Hasta";

            const svc = serviceId ? servicesById[serviceId] : undefined;
            const serviceName = svc?.serviceName ?? "Hizmet";
            const serviceDuration = svc?.serviceDuration;

            const employee = employeesByEmail[employeeEmail] ?? {
              email: employeeEmail,
              name: "Çalışan",
              role: "",
            };

            const start = extractDate(ev.start) ?? "";
            const end = extractDate(ev.end) ?? "";
            const status = ev.status ?? "";

            return {
              id,
              patientName,
              serviceName,
              serviceDuration,
              employee,
              employeeEmail,
              extendedProps: { patientId, serviceId, employeeEmail },
              start,
              end,
              status,
            };
          });

        setAppointments(cards);
        setEmployees(employeeCards);
      } catch (err) {
        console.error(err);
        setAppointments([]);
        setEmployees([]);
      }
    };

    fetchData();
  }, [idToken, companyId]);

  return { appointments, employees };
}
