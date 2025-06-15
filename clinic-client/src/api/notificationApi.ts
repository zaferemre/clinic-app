import { NotificationInfo } from "../types/sharedTypes";
import { request } from "./apiClient";

export function getNotifications(
  token: string,
  companyId: string
): Promise<NotificationInfo[]> {
  return request<NotificationInfo[]>(`/company/${companyId}/notifications`, {
    token,
  });
}

export function markNotificationCalled(
  token: string,
  companyId: string,
  notificationId: string
): Promise<void> {
  return request(
    `/company/${companyId}/notifications/${notificationId}/mark-called`,
    { method: "PATCH", token }
  );
}

export function flagPatientCall(
  token: string,
  companyId: string,
  patientId: string,
  note?: string
): Promise<void> {
  return request(`/company/${companyId}/patients/${patientId}/flag-call`, {
    method: "PATCH",
    token,
    body: { note },
  });
}
