import { useEffect, useState } from "react";
import { getAppointments } from "../api/appointmentApi";
import { getPatients } from "../api/patientApi";
import { getEmployees } from "../api/employeeApi";
import { getServices } from "../api/servicesApi";

import type { Patient, ServiceInfo } from "../types/sharedTypes";

// ——— 1) FullCalendar event shape as returned by your API
interface RawFCEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    patientId: string;
    serviceId: string;
    employeeEmail: string;
    status?: string;
  };
  color?: string;
}

// ——— 2) Card types for your UI
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
  serviceId: string;
  start: string;
  end: string;
  status: string;
}

export function useEnrichedAppointments(idToken: string, companyId: string) {
  const [appointments, setAppointments] = useState<CardAppointment[]>([]);
  const [employees, setEmployees] = useState<CardEmployee[]>([]);
  const [services, setServices] = useState<ServiceInfo[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!idToken || !companyId) {
        setAppointments([]);
        setEmployees([]);
        setServices([]);
        return;
      }

      // 3) fetch raw FC events, patients, employees, services
      const [rawEvents, patients, empList, svcList] = await Promise.all([
        getAppointments(idToken, companyId) as Promise<RawFCEvent[]>,
        getPatients(idToken, companyId),
        getEmployees(idToken, companyId),
        getServices(idToken, companyId),
      ]);

      // 4) build lookup maps
      const patById: Record<string, Patient> = Object.fromEntries(
        patients.map((p) => [String(p._id), p])
      );

      const empByEmail: Record<string, CardEmployee> = {};
      const empCards: CardEmployee[] = empList.map((e) => {
        const card: CardEmployee = {
          email: e.email ?? "",
          name: e.name ?? "Çalışan",
          avatarUrl: e.pictureUrl,
          role: e.role,
        };
        empByEmail[card.email] = card;
        return card;
      });

      const svcById: Record<string, ServiceInfo> = Object.fromEntries(
        svcList.map((s) => [String(s._id), s])
      );

      // 5) enrich and map to CardAppointment
      const cards: CardAppointment[] = rawEvents.map((ev) => {
        const id = ev.id;
        const patientId = ev.extendedProps.patientId;
        const serviceId = ev.extendedProps.serviceId;
        const employeeEmail = ev.extendedProps.employeeEmail;
        const status = ev.extendedProps.status ?? "";

        // patientName fallback to FC title
        const patientName = patById[patientId]?.name ?? ev.title ?? "Hasta";

        const svcInfo = svcById[serviceId];
        const serviceName = svcInfo?.serviceName ?? "Hizmet";
        const serviceDuration = svcInfo?.serviceDuration;

        const employee = empByEmail[employeeEmail] ?? {
          email: employeeEmail,
          name: "Çalışan",
          role: "",
        };

        return {
          id,
          patientName,
          serviceName,
          serviceDuration,
          employee,
          employeeEmail,
          serviceId,
          start: ev.start,
          end: ev.end,
          status,
        };
      });

      setAppointments(cards);
      setEmployees(empCards);
      setServices(svcList);
    }

    fetchData().catch(console.error);
  }, [idToken, companyId]);

  return { appointments, employees, services };
}
