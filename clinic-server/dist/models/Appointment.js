"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// models/Appointment.ts
const mongoose_1 = require("mongoose");
const AppointmentSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
    },
    clinicId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Clinic",
        required: true,
    },
    patientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Patient",
    },
    groupId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Group",
    },
    employeeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
    },
    serviceId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
    },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    status: {
        type: String,
        enum: ["scheduled", "done", "cancelled", "no-show"],
        default: "scheduled",
    },
    appointmentType: {
        type: String,
        enum: ["individual", "group"],
        required: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Employee",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Appointment", AppointmentSchema);
