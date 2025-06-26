"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    companyId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Company", required: true },
    clinicId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Clinic", required: true },
    patientId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Patient" },
    groupId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Group" },
    type: {
        type: String,
        enum: ["call", "sms", "email", "whatsapp", "system"],
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "sent", "failed", "done"],
        default: "pending",
    },
    message: { type: String, required: true },
    title: { type: String }, // Optional: short subject/title
    trigger: { type: String },
    workerUid: { type: String }, // Action taker
    targetUserId: { type: String }, // (optional) direct notification recipient
    note: { type: String },
    sentAt: { type: Date },
    // New: in-app read status & when read
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    // New: importance
    priority: {
        type: String,
        enum: ["low", "normal", "high"],
        default: "normal",
    },
    // New: flexible JSON blob for extra data
    meta: { type: mongoose_1.Schema.Types.Mixed },
}, { timestamps: true });
// For fast list queries in dashboards
NotificationSchema.index({
    companyId: 1,
    clinicId: 1,
    status: 1,
    createdAt: -1,
});
exports.default = (0, mongoose_1.model)("Notification", NotificationSchema);
