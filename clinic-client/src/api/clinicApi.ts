// src/api/clinicApi.ts
import { Clinic, CreateClinicPayload } from "../types/sharedTypes";
import { request } from "./apiClient";

export function getClinics(
  token: string,
  companyId: string
): Promise<Clinic[]> {
  return request<Clinic[]>(`/company/${companyId}/clinics`, { token });
}

export function createClinic(
  token: string,
  companyId: string,
  payload: CreateClinicPayload
): Promise<Clinic> {
  return request<Clinic>(`/company/${companyId}/clinics`, {
    method: "POST",
    token,
    body: payload,
  });
}

export function getClinicById(
  token: string,
  companyId: string,
  clinicId: string
): Promise<Clinic> {
  return request<Clinic>(`/company/${companyId}/clinics/${clinicId}`, {
    token,
  });
}

export function updateClinic(
  token: string,
  companyId: string,
  clinicId: string,
  updates: Partial<Omit<Clinic, "_id" | "companyId">>
): Promise<Clinic> {
  return request<Clinic>(`/company/${companyId}/clinics/${clinicId}`, {
    method: "PATCH",
    token,
    body: updates,
  });
}

export function deleteClinic(
  token: string,
  companyId: string,
  clinicId: string
): Promise<void> {
  return request(`/company/${companyId}/clinics/${clinicId}`, {
    method: "DELETE",
    token,
  });
}
