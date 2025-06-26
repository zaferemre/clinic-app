import { Types } from "mongoose";
import * as notifRepo from "../dataAccess/notificationRepository";
import createError from "http-errors";

export async function createNotification(
  companyId: string,
  clinicId: string,
  data: {
    patientId?: string;
    groupId?: string;
    type: "call" | "sms" | "email" | "whatsapp" | "system";
    status?: "pending" | "sent" | "failed" | "done";
    message: string;
    title?: string;
    trigger?: string;
    workerUid?: string;
    targetUserId?: string;
    note?: string;
    sentAt?: Date;
    priority?: "low" | "normal" | "high";
    meta?: any;
  }
) {
  return notifRepo.createNotification({
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
    patientId: data.patientId ? new Types.ObjectId(data.patientId) : undefined,
    groupId: data.groupId ? new Types.ObjectId(data.groupId) : undefined,
    type: data.type,
    status: data.status ?? "pending",
    message: data.message,
    title: data.title,
    trigger: data.trigger,
    workerUid: data.workerUid,
    targetUserId: data.targetUserId,
    note: data.note,
    sentAt: data.sentAt,
    priority: data.priority,
    meta: data.meta,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

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
