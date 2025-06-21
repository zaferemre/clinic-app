// services/notificationService.ts
import * as repoNotif from "../dataAccess/notificationRepository";
import createError from "http-errors";

export async function listNotifications(companyId: string, clinicId: string) {
  return repoNotif.listNotifications(companyId, clinicId);
}

export async function markNotificationDone(
  companyId: string,
  clinicId: string,
  notificationId: string
) {
  const n = await repoNotif.updateNotificationStatus(notificationId, "done");
  if (!n) throw createError(404, "Notification not found");
  return n;
}
export function processPending() {
  throw new Error("Function not implemented.");
}
