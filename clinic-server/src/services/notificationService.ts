import * as notifRepo from "../dataAccess/notificationRepository";
import createError from "http-errors";

export async function listNotifications(companyId: string, clinicId: string) {
  return notifRepo.listNotifications(companyId, clinicId);
}

export async function markNotificationDone(
  companyId: string,
  clinicId: string,
  notificationId: string
) {
  // You might want to check companyId/clinicId for permission, but for now:
  const notif = await notifRepo.updateNotificationStatus(
    notificationId,
    "done"
  );
  if (!notif) throw createError(404, "Notification not found");
  return notif;
}
export function processPending() {
  throw new Error("Function not implemented.");
}
