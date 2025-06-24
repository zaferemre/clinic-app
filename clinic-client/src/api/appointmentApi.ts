// src/api/appointmentApi.ts
import { CalendarEvent } from "../types/sharedTypes";
import { request } from "./apiClient";

export function getAppointments(
  token: string,
  companyId: string,
  clinicId: string,
  filters?: { employeeId?: string; patientId?: string; groupId?: string }
): Promise<CalendarEvent[]> {
  const params: string[] = [];
  if (filters?.employeeId)
    params.push(`employeeId=${encodeURIComponent(filters.employeeId)}`);
  if (filters?.patientId)
    params.push(`patientId=${encodeURIComponent(filters.patientId)}`);
  if (filters?.groupId)
    params.push(`groupId=${encodeURIComponent(filters.groupId)}`);
  const qs = params.length ? `?${params.join("&")}` : "";
  return request<CalendarEvent[]>(
    `/company/${companyId}/clinics/${clinicId}/appointments${qs}`,
    { token }
  );
}

export function getAppointmentById(
  token: string,
  companyId: string,
  clinicId: string,
  appointmentId: string
): Promise<CalendarEvent> {
  return request<CalendarEvent>(
    `/company/${companyId}/clinics/${clinicId}/appointments/${appointmentId}`,
    { token }
  );
}

export function createAppointment(
  token: string,
  companyId: string,
  clinicId: string,
  payload: {
    patientId?: string;
    groupId?: string;
    employeeId: string;
    serviceId?: string;
    start: string;
    end: string;
    appointmentType: "individual" | "group";
  }
): Promise<CalendarEvent> {
  return request<CalendarEvent>(
    `/company/${companyId}/clinics/${clinicId}/appointments`,
    { method: "POST", token, body: payload }
  );
}

export function updateAppointment(
  token: string,
  companyId: string,
  clinicId: string,
  appointmentId: string,
  updates: Partial<{
    start: string;
    end: string;
    serviceId: string;
    employeeId: string;
    groupId?: string | null;
  }>
): Promise<CalendarEvent> {
  return request<CalendarEvent>(
    `/company/${companyId}/clinics/${clinicId}/appointments/${appointmentId}`,
    { method: "PATCH", token, body: updates }
  );
}

export function deleteAppointment(
  token: string,
  companyId: string,
  clinicId: string,
  appointmentId: string
): Promise<void> {
  return request(
    `/company/${companyId}/clinics/${clinicId}/appointments/${appointmentId}`,
    { method: "DELETE", token }
  );
}
