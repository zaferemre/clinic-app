// src/hooks/useTodaysAppointments.ts
import { useEffect, useState } from "react";
import { useEnrichedAppointments } from "./useEnrichedAppointments";
import type { CardEmployee, CardAppointment } from "../types/sharedTypes";

// Hook to return today's appointments and card-ready employees
export function useTodaysAppointments(
  idToken: string,
  companyId: string,
  clinicId: string
) {
  const { appointments: enriched, employees: empInfos } =
    useEnrichedAppointments(idToken, companyId, clinicId);

  const [cards, setCards] = useState<CardAppointment[]>([]);
  const [cardEmployees, setCardEmployees] = useState<CardEmployee[]>([]);

  useEffect(() => {
    const employees = empInfos.map((e) => ({
      email: e.email,
      name: e.name || e.email,
      avatarUrl: e.pictureUrl,
      role: e.role,
    }));
    setCardEmployees(employees);

    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const todayStr = `${y}-${m}-${d}`;

    const todays = enriched
      .filter((evt) => evt.start.startsWith(todayStr))
      .map((evt) => ({
        id: evt.id,
        patientName: evt.patientName || "",
        groupName: evt.groupName || "",
        serviceName: evt.serviceName || "",
        serviceDuration: evt.serviceDuration,
        employee: employees.find((ce) => ce.email === evt.employeeEmail) || {
          email: evt.employeeEmail || "",
          name: evt.employeeName || evt.employeeEmail || "",
        },
        employeeEmail: evt.employeeEmail || "",
        extendedProps: {
          patientId: evt.patientId,
          serviceId: evt.serviceId,
          employeeEmail: evt.employeeEmail,
        },
        start: evt.start,
        end: evt.end,
        status: evt.status,
      }));

    setCards(todays);
  }, [enriched, empInfos]);

  return { appointments: cards, employees: cardEmployees };
}
