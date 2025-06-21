// src/api/groupApi.ts
import { CalendarEvent, Group } from "../types/sharedTypes";
import { request } from "./apiClient";

export function listGroups(
  token: string,
  companyId: string,
  clinicId: string
): Promise<Group[]> {
  return request<Group[]>(`/company/${companyId}/clinics/${clinicId}/groups`, {
    token,
  });
}

export function createGroup(
  token: string,
  companyId: string,
  clinicId: string,
  payload: Omit<
    Group,
    | "_id"
    | "companyId"
    | "clinicId"
    | "appointments"
    | "createdAt"
    | "updatedAt"
  >
): Promise<Group> {
  return request<Group>(`/company/${companyId}/clinics/${clinicId}/groups`, {
    method: "POST",
    token,
    body: payload,
  });
}

export function getGroupById(
  token: string,
  companyId: string,
  clinicId: string,
  groupId: string
): Promise<Group> {
  return request<Group>(
    `/company/${companyId}/clinics/${clinicId}/groups/${groupId}`,
    { token }
  );
}

export function updateGroup(
  token: string,
  companyId: string,
  clinicId: string,
  groupId: string,
  updates: Partial<
    Omit<
      Group,
      | "_id"
      | "companyId"
      | "clinicId"
      | "appointments"
      | "createdAt"
      | "updatedAt"
    >
  >
): Promise<Group> {
  return request<Group>(
    `/company/${companyId}/clinics/${clinicId}/groups/${groupId}`,
    { method: "PATCH", token, body: updates }
  );
}

export function deleteGroup(
  token: string,
  companyId: string,
  clinicId: string,
  groupId: string
): Promise<void> {
  return request(
    `/company/${companyId}/clinics/${clinicId}/groups/${groupId}`,
    { method: "DELETE", token }
  );
}

export function addPatientToGroup(
  token: string,
  companyId: string,
  clinicId: string,
  groupId: string,
  patientId: string
): Promise<void> {
  return request(
    `/company/${companyId}/clinics/${clinicId}/groups/${groupId}/patients`,
    { method: "POST", token, body: { patientId } }
  );
}

export function removePatientFromGroup(
  token: string,
  companyId: string,
  clinicId: string,
  groupId: string,
  patientId: string
): Promise<void> {
  return request(
    `/company/${companyId}/clinics/${clinicId}/groups/${groupId}/patients/${patientId}`,
    { method: "DELETE", token }
  );
}

/** → New helper for creating a group‐scoped appointment: */
export function createGroupAppointment(
  token: string,
  companyId: string,
  clinicId: string,
  payload: {
    groupId: string;
    start: string;
    end: string;
  }
): Promise<CalendarEvent> {
  return request<CalendarEvent>(
    `/company/${companyId}/clinics/${clinicId}/groups/${payload.groupId}/appointments`,
    {
      method: "POST",
      token,
      body: {
        start: payload.start,
        end: payload.end,
        appointmentType: "group",
      },
    }
  );
}
