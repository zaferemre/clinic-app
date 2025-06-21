// src/api/notificationApi.ts
import { request } from "./apiClient";
import { NotificationInfo } from "../types/sharedTypes";

/**
 * Fetch notifications and normalize ID:
 */
export function getNotifications(
  token: string,
  companyId: string,
  clinicId: string
): Promise<NotificationInfo[]> {
  return request<NotificationInfo[]>(
    `/company/${companyId}/clinics/${clinicId}/notifications`,
    { token }
  ).then((list) =>
    list.map((n: any) => ({
      ...n,
      id: n._id || n.id,
    }))
  );
}

/**
 * Mark a notification as done and normalize ID:
 */
export function markNotificationCalled(
  token: string,
  companyId: string,
  clinicId: string,
  notificationId: string
): Promise<NotificationInfo> {
  type NotificationWithOptionalId = NotificationInfo & { _id?: string };

  return request<NotificationWithOptionalId>(
    `/company/${companyId}/clinics/${clinicId}/notifications/${notificationId}/done`,
    { method: "PATCH", token }
  ).then((n: NotificationWithOptionalId) => ({
    ...n,
    id: n._id || n.id,
  }));
}
