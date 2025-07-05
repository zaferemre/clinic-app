import { Types } from "mongoose";
import * as notifRepo from "../dataAccess/notificationRepository";
import * as employeeRepo from "../dataAccess/employeeRepository";
import User from "../models/User";
import createError from "http-errors";
import { Expo } from "expo-server-sdk";
const expo = new Expo();

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
  // 1. DB'ye kaydet
  const notif = (await notifRepo.createNotification({
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
  })) as { _id: Types.ObjectId } & Record<string, any>;

  // 2. Klinik çalışanlarının userUid'lerini çek
  const employees = await employeeRepo.listEmployees(companyId, clinicId);
  const userUids = employees.map((e: any) => e.userUid);

  // 3. Bu userUid'lere sahip kullanıcıları çek (push tokenları için)
  const users = await User.find({ uid: { $in: userUids } }).select(
    "pushTokens"
  );
  // Uniq ve boş olmayan tokenlar
  const pushTokens: string[] = Array.from(
    new Set(users.flatMap((u) => u.pushTokens ?? []).filter(Boolean))
  );

  // 4. Push notification gönder
  if (pushTokens.length > 0) {
    const messages = pushTokens.map((token) => ({
      to: token,
      sound: "default",
      title: data.title ?? "Yeni Bildirim",
      body: data.message,
      data: { notificationId: notif._id.toString(), ...data },
    }));

    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error("Push notification send error:", error);
      }
    }
  }

  return notif;
}

export async function listNotifications(companyId: string, clinicId: string) {
  return notifRepo.listNotifications(companyId, clinicId);
}

export async function markNotificationDone(
  companyId: string,
  clinicId: string,
  notificationId: string
) {
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
