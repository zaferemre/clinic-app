import { request } from "./apiClient";
import { NotificationInfo } from "../types/sharedTypes";

/**
 * Fetch notifications for a clinic.
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
 * Create a new notification.
 */
export function createNotification(
  token: string,
  companyId: string,
  clinicId: string,
  notification: Omit<NotificationInfo, "id" | "_id" | "createdAt" | "updatedAt">
): Promise<NotificationInfo> {
  return request<NotificationInfo>(
    `/company/${companyId}/clinics/${clinicId}/notifications`,
    {
      method: "POST",
      token,
      body: notification,
      headers: { "Content-Type": "application/json" },
    }
  ).then((n: any) => ({
    ...n,
    id: n._id || n.id,
  }));
}

/**
 * Mark a notification as done.
 */
export function markNotificationDone(
  token: string,
  companyId: string,
  clinicId: string,
  notificationId: string
): Promise<NotificationInfo> {
  return request<NotificationInfo>(
    `/company/${companyId}/clinics/${clinicId}/notifications/${notificationId}/done`,
    {
      method: "PATCH",
      token,
    }
  ).then((n: any) => ({
    ...n,
    id: n._id || n.id,
  }));
}

/**
 * Delete a notification.
 */
export function deleteNotification(
  token: string,
  companyId: string,
  clinicId: string,
  notificationId: string
): Promise<void> {
  return request<void>(
    `/company/${companyId}/clinics/${clinicId}/notifications/${notificationId}`,
    {
      method: "DELETE",
      token,
    }
  );
}
