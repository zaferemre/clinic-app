import { CalendarEvent } from "../types/sharedTypes";
import { request } from "./apiClient";

/**
 * Fetch all appointments for a company, with optional filters.
 */
export function getAppointments(
  token: string,
  companyId: string,
  employeeEmail?: string,
  serviceId?: string
): Promise<CalendarEvent[]> {
  const params: string[] = [];
  if (employeeEmail)
    params.push(`employeeEmail=${encodeURIComponent(employeeEmail)}`);
  if (serviceId) params.push(`serviceId=${encodeURIComponent(serviceId)}`);
  const qs = params.length ? `?${params.join("&")}` : "";
  return request<CalendarEvent[]>(`/company/${companyId}/appointments${qs}`, {
    token,
  });
}

/**
 * Fetch a single appointment by its ID.
 */
export function getAppointmentById(
  token: string,
  companyId: string,
  appointmentId: string
): Promise<CalendarEvent> {
  return request<CalendarEvent>(
    `/company/${companyId}/appointments/${appointmentId}`,
    { token }
  );
}

/**
 * Create a new appointment.
 * Accepts all required parameters individually.
 */
export function createAppointment(
  token: string,
  companyId: string,
  patientId: string,
  employeeEmail: string,
  serviceId: string,
  start: string,
  end: string
): Promise<CalendarEvent> {
  return request<CalendarEvent>(`/company/${companyId}/appointments`, {
    method: "POST",
    token,
    body: { patientId, employeeEmail, serviceId, start, end },
  });
}

/**
 * Update an existing appointment.
 */
export function updateAppointment(
  token: string,
  companyId: string,
  appointmentId: string,
  start: string,
  end: string,
  serviceId?: string,
  employeeEmail?: string
): Promise<CalendarEvent> {
  const body: {
    start: string;
    end: string;
    serviceId?: string;
    employeeEmail?: string;
  } = { start, end };
  if (serviceId) body.serviceId = serviceId;
  if (employeeEmail) body.employeeEmail = employeeEmail;

  return request<CalendarEvent>(
    `/company/${companyId}/appointments/${appointmentId}`,
    {
      method: "PATCH",
      token,
      body,
    }
  );
}

/**
 * Delete an appointment by ID.
 */
export function deleteAppointment(
  token: string,
  companyId: string,
  appointmentId: string
): Promise<void> {
  return request(`/company/${companyId}/appointments/${appointmentId}`, {
    method: "DELETE",
    token,
  });
}

/**
 * Fetch past appointments for a specific patient.
 */
export function getPatientAppointments(
  token: string,
  companyId: string,
  patientId: string
): Promise<
  {
    id: string;
    start: string;
    end: string;
    status: string;
    workerEmail: string;
  }[]
> {
  return request(`/company/${companyId}/patients/${patientId}/appointments`, {
    token,
  });
}
