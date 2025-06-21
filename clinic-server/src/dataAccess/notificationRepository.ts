import Notification, { NotificationDocument } from "../models/Notification";
import { Types } from "mongoose";

export interface NotificationCreateInput {
  companyId: Types.ObjectId;
  clinicId: Types.ObjectId;
  patientId: Types.ObjectId;
  type: NotificationDocument["type"];
  status: NotificationDocument["status"];
  note?: string;
  createdBy: Types.ObjectId;
}

/**
 * Create a new notification.
 */
export function createNotification(
  doc: NotificationCreateInput
): Promise<NotificationDocument> {
  return Notification.create(doc);
}

/**
 * List all notifications for a given company & clinic.
 */
export function listNotifications(
  companyId: string,
  clinicId: string
): Promise<NotificationDocument[]> {
  return Notification.find({
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
  })
    .sort({ createdAt: -1 })
    .exec();
}

/**
 * Update the status of a notification by its ID.
 */
export function updateNotificationStatus(
  notificationId: string,
  status: NotificationDocument["status"]
): Promise<NotificationDocument | null> {
  return Notification.findByIdAndUpdate(
    notificationId,
    { status },
    { new: true }
  ).exec();
}
