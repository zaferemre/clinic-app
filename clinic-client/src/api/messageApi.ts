// src/api/messageApi.ts
import { IMessage } from "../types/sharedTypes";
import { request } from "./apiClient";

export function getMessages(
  token: string,
  companyId: string
): Promise<IMessage[]> {
  return request<IMessage[]>(`/company/${companyId}/messages`, { token });
}

export function schedulePatientMessage(
  token: string,
  companyId: string,
  clinicId: string,
  patientId: string,
  body: { text: string; scheduledFor: string }
): Promise<IMessage> {
  return request<IMessage>(
    `/company/${companyId}/clinics/${clinicId}/messages/patient/${patientId}`,
    { method: "POST", token, body }
  );
}

export function scheduleBulkMessage(
  token: string,
  companyId: string,
  clinicId: string,
  body: { text: string; scheduledFor: string }
): Promise<IMessage> {
  return request<IMessage>(
    `/company/${companyId}/clinics/${clinicId}/messages/bulk`,
    { method: "POST", token, body }
  );
}
