"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
exports.listNotifications = listNotifications;
exports.updateNotificationStatus = updateNotificationStatus;
exports.deleteNotificationById = deleteNotificationById;
const Notification_1 = __importDefault(require("../models/Notification"));
const mongoose_1 = require("mongoose");
// Create a notification
async function createNotification(doc) {
    return Notification_1.default.create(doc);
}
// List notifications by company/clinic
async function listNotifications(companyId, clinicId) {
    return Notification_1.default.find({
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
    })
        .sort({ createdAt: -1 })
        .exec();
}
// Update status (e.g., mark as done)
async function updateNotificationStatus(notificationId, status) {
    return Notification_1.default.findByIdAndUpdate(notificationId, { status }, { new: true }).exec();
}
// Delete a notification by id
async function deleteNotificationById(notificationId) {
    await Notification_1.default.findByIdAndDelete(notificationId).exec();
}
