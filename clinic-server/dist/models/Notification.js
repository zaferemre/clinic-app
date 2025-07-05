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
    title: { type: String },
    trigger: { type: String },
    workerUid: { type: String },
    targetUserId: { type: String },
    note: { type: String },
    sentAt: { type: Date },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    priority: {
        type: String,
        enum: ["low", "normal", "high"],
        default: "normal",
    },
    meta: { type: mongoose_1.Schema.Types.Mixed },
}, { timestamps: true });
// For fast list queries in dashboards
NotificationSchema.index({
    companyId: 1,
    clinicId: 1,
    status: 1,
    createdAt: -1,
});
// Virtual id field for frontend
NotificationSchema.virtual("id").get(function () {
    // @ts-ignore
    return this._id.toString();
});
NotificationSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // If you want to remove _id from responses, uncomment:
        // delete ret._id;
    },
});
exports.default = (0, mongoose_1.model)("Notification", NotificationSchema);
