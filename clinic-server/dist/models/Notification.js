"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "company",
        required: true,
    },
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
    trigger: { type: String },
    workerId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Employee" },
    note: { type: String },
    sentAt: { type: Date },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Notification", NotificationSchema);
