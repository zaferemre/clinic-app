import { CalendarEvent } from "../types/sharedTypes";
import { getAppointments } from "./appointmentApi";

export async function getCalendarEvents(
  token: string,
  companyId: string,
  filters?: { employeeEmail?: string; serviceId?: string }
): Promise<CalendarEvent[]> {
  return getAppointments(
    token,
    companyId,
    filters?.employeeEmail,
    filters?.serviceId
  );
}
