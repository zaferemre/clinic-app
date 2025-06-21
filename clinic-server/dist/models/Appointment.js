"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        required: false,
    },
    groupId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Group",
        required: false,
    },
    employeeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
    },
    serviceId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Service",
        required: false,
    },
    start: {
        type: Date,
        required: true,
    },
    end: {
        type: Date,
        required: true,
    },
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
    // Allow string OR ObjectId for createdBy
    createdBy: {
        type: String, // <--- FIXED HERE
        required: true,
    },
}, {
    timestamps: true,
});
// Compound index for fast lookups (unchanged)
AppointmentSchema.index({
    companyId: 1,
    clinicId: 1,
    employeeId: 1,
    start: 1,
    end: 1,
});
exports.default = (0, mongoose_1.model)("Appointment", AppointmentSchema);
