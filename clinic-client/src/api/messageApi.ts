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
  patientId: string,
  body: { text: string; scheduledFor: string }
): Promise<IMessage> {
  return request<IMessage>(
    `/company/${companyId}/messages/patient/${patientId}`,
    {
      method: "POST",
      token,
      body,
    }
  );
}

export function scheduleBulkMessage(
  token: string,
  companyId: string,
  body: { text: string; scheduledFor: string }
): Promise<IMessage> {
  return request<IMessage>(`/company/${companyId}/messages/bulk`, {
    method: "POST",
    token,
    body,
  });
}

export function scheduleAutoRemind(
  token: string,
  companyId: string,
  offsetHours: number
): Promise<{ message: string; offsetHours: number }> {
  return request(`/company/${companyId}/messages/auto-remind`, {
    method: "POST",
    token,
    body: { offsetHours },
  });
}
