"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
exports.listNotifications = listNotifications;
exports.markNotificationDone = markNotificationDone;
exports.processPending = processPending;
const mongoose_1 = require("mongoose");
const notifRepo = __importStar(require("../dataAccess/notificationRepository"));
const employeeRepo = __importStar(require("../dataAccess/employeeRepository"));
const User_1 = __importDefault(require("../models/User"));
const http_errors_1 = __importDefault(require("http-errors"));
const expo_server_sdk_1 = require("expo-server-sdk");
const expo = new expo_server_sdk_1.Expo();
async function createNotification(companyId, clinicId, data) {
    // 1. DB'ye kaydet
    const notif = (await notifRepo.createNotification({
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
        patientId: data.patientId ? new mongoose_1.Types.ObjectId(data.patientId) : undefined,
        groupId: data.groupId ? new mongoose_1.Types.ObjectId(data.groupId) : undefined,
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
    }));
    // 2. Klinik çalışanlarının userUid'lerini çek
    const employees = await employeeRepo.listEmployees(companyId, clinicId);
    const userUids = employees.map((e) => e.userUid);
    // 3. Bu userUid'lere sahip kullanıcıları çek (push tokenları için)
    const users = await User_1.default.find({ uid: { $in: userUids } }).select("pushTokens");
    // Uniq ve boş olmayan tokenlar
    const pushTokens = Array.from(new Set(users.flatMap((u) => u.pushTokens ?? []).filter(Boolean)));
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
            }
            catch (error) {
                console.error("Push notification send error:", error);
            }
        }
    }
    return notif;
}
async function listNotifications(companyId, clinicId) {
    return notifRepo.listNotifications(companyId, clinicId);
}
async function markNotificationDone(companyId, clinicId, notificationId) {
    const notif = await notifRepo.updateNotificationStatus(notificationId, "done");
    if (!notif)
        throw (0, http_errors_1.default)(404, "Notification not found");
    return notif;
}
function processPending() {
    throw new Error("Function not implemented.");
}
