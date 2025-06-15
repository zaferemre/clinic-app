import { Patient } from "../types/sharedTypes";
import { request } from "./apiClient";

export function getPatients(
  token: string,
  companyId: string
): Promise<Patient[]> {
  return request<Patient[]>(`/company/${companyId}/patients`, { token });
}

export function getPatientById(
  token: string,
  companyId: string,
  patientId: string
): Promise<Patient> {
  return request<Patient>(`/company/${companyId}/patients/${patientId}`, {
    token,
  });
}

export function createPatient(
  token: string,
  companyId: string,
  payload: Omit<Patient, "_id">
): Promise<Patient> {
  return request<Patient>(`/company/${companyId}/patients`, {
    method: "POST",
    token,
    body: payload,
  });
}

export function updatePatientField(
  token: string,
  companyId: string,
  patientId: string,
  updates: Partial<Pick<Patient, "credit" | "name" | "age" | "phone" | "note">>
): Promise<Patient> {
  return request<Patient>(`/company/${companyId}/patients/${patientId}`, {
    method: "PATCH",
    token,
    body: updates,
  });
}

export function deletePatient(
  token: string,
  companyId: string,
  patientId: string
): Promise<void> {
  return request(`/company/${companyId}/patients/${patientId}`, {
    method: "DELETE",
    token,
  });
}

export function recordPayment(
  token: string,
  companyId: string,
  patientId: string,
  method: string
): Promise<Patient> {
  return request<Patient>(
    `/company/${companyId}/patients/${patientId}/payment`,
    {
      method: "PATCH",
      token,
      body: { method },
    }
  );
}
