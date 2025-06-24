import Notification, { NotificationDocument } from "../models/Notification";
import { Types } from "mongoose";

// Create a notification
export async function createNotification(
  doc: Partial<NotificationDocument>
): Promise<NotificationDocument> {
  return Notification.create(doc);
}

// List notifications by company/clinic
export async function listNotifications(
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

// Update status (e.g., mark as done)
export async function updateNotificationStatus(
  notificationId: string,
  status: NotificationDocument["status"]
): Promise<NotificationDocument | null> {
  return Notification.findByIdAndUpdate(
    notificationId,
    { status },
    { new: true }
  ).exec();
}

// Delete a notification by id
export async function deleteNotificationById(
  notificationId: string
): Promise<void> {
  await Notification.findByIdAndDelete(notificationId).exec();
}
