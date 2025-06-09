"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const appointmentSchema = new mongoose_1.default.Schema({
    companyId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "Company",
    },
    patientId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "Patient",
    },
    employeeEmail: {
        type: String,
        required: true,
    },
    serviceId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "Service",
    },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    status: {
        type: String,
        enum: ["scheduled", "done", "cancelled"],
        default: "scheduled",
    },
}, { timestamps: true });
const Appointment = mongoose_1.default.models.Appointment ||
    mongoose_1.default.model("Appointment", appointmentSchema);
exports.default = Appointment;
