// src/api/patientApi.ts
import { NotificationInfo, Patient } from "../types/sharedTypes";
import { request } from "./apiClient";

export function getPatients(
  token: string,
  companyId: string,
  clinicId: string
): Promise<Patient[]> {
  return request<Patient[]>(
    `/company/${companyId}/clinics/${clinicId}/patients`,
    { token }
  );
}

export function getPatientById(
  token: string,
  companyId: string,
  clinicId: string,
  patientId: string
): Promise<Patient> {
  return request<Patient>(
    `/company/${companyId}/clinics/${clinicId}/patients/${patientId}`,
    { token }
  );
}

export function createPatient(
  token: string,
  companyId: string,
  clinicId: string,
  payload: Omit<Patient, "_id" | "companyId" | "clinicId">
): Promise<Patient> {
  return request<Patient>(
    `/company/${companyId}/clinics/${clinicId}/patients`,
    { method: "POST", token, body: payload }
  );
}

export function updatePatientField(
  token: string,
  companyId: string,
  clinicId: string,
  patientId: string,
  updates: Partial<Pick<Patient, "credit" | "name" | "age" | "phone" | "note">>
): Promise<Patient> {
  return request<Patient>(
    `/company/${companyId}/clinics/${clinicId}/patients/${patientId}`,
    { method: "PATCH", token, body: updates }
  );
}

export function deletePatient(
  token: string,
  companyId: string,
  clinicId: string,
  patientId: string
): Promise<void> {
  return request(
    `/company/${companyId}/clinics/${clinicId}/patients/${patientId}`,
    { method: "DELETE", token }
  );
}

export function recordPayment(
  token: string,
  companyId: string,
  clinicId: string,
  patientId: string,
  entry: { method: string; amount: number; note?: string }
): Promise<Patient> {
  return request<Patient>(
    `/company/${companyId}/clinics/${clinicId}/patients/${patientId}/payments`,
    { method: "POST", token, body: entry }
  );
}
export function getPatientAppointments(
  token: string,
  companyId: string,
  clinicId: string,
  patientId: string
): Promise<
  {
    id: string;
    start: string;
    end: string;
    status: string;
    employeeId: string;
  }[]
> {
  return request(
    `/company/${companyId}/clinics/${clinicId}/patients/${patientId}/appointments`,
    { token }
  );
}

// and this too:
export function flagPatientCall(
  token: string,
  companyId: string,
  clinicId: string,
  patientId: string,
  note?: string
): Promise<NotificationInfo> {
  return request<NotificationInfo>(
    `/company/${companyId}/clinics/${clinicId}/patients/${patientId}/call-flag`,
    { method: "POST", token, body: { note } }
  );
}
