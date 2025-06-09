"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const notificationSchema = new mongoose_1.default.Schema({
    companyId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "Clinic",
    },
    patientId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "Patient",
    },
    type: { type: String, enum: ["call"], required: true },
    status: { type: String, enum: ["pending", "done"], default: "pending" },
    workerEmail: { type: String },
    note: { type: String, default: "" },
}, { timestamps: true });
const Notification = mongoose_1.default.models.Notification ||
    mongoose_1.default.model("Notification", notificationSchema);
exports.default = Notification;
