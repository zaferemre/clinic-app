// src/api/calendarApi.ts
import { CalendarEvent } from "../types/sharedTypes";
import * as appt from "./appointmentApi";

export function getCalendarEvents(
  token: string,
  companyId: string,
  clinicId: string,
  filters?: { employeeId?: string; patientId?: string; groupId?: string }
): Promise<CalendarEvent[]> {
  return appt.getAppointments(token, companyId, clinicId, filters);
}
