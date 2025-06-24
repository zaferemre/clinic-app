import { useEffect, useState } from "react";
import type {
  CardEmployee,
  CardAppointment,
  EnrichedAppointment,
} from "../types/sharedTypes";

export function useTodaysAppointments(
  enrichedAppointments: EnrichedAppointment[],
  employees: CardEmployee[]
) {
  const [cards, setCards] = useState<CardAppointment[]>([]);

  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const todayStr = `${y}-${m}-${d}`;

    const cardsList: CardAppointment[] = enrichedAppointments
      .filter((evt) => evt.start.startsWith(todayStr))
      .map((evt) => {
        const emp = employees.find((e) => e.userId === evt.employeeId) || {
          userId: evt.employeeId,
          name: evt.employeeName ?? "Çalışan",
        };

        return {
          id: evt.id,
          employeeId: evt.employeeId,
          employee: emp,
          groupName: evt.groupName ?? "",
          patientName: evt.patientName ?? "",
          serviceName: evt.serviceName ?? "",
          serviceDuration: evt.serviceDuration,
          start: evt.start,
          end: evt.end,
          status: evt.status ?? "",
        };
      });

    setCards(cardsList);
  }, [enrichedAppointments, employees]);

  return { appointments: cards };
}
