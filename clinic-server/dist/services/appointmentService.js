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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppointments = getAppointments;
exports.getAppointmentById = getAppointmentById;
exports.createAppointment = createAppointment;
exports.updateAppointment = updateAppointment;
exports.deleteAppointment = deleteAppointment;
// src/services/appointmentService.ts
const repo = __importStar(require("../dataAccess/appointmentRepository"));
const patientRepo = __importStar(require("../dataAccess/patientRepository"));
async function getAppointments(companyId) {
    const appts = await repo.findByCompany(companyId);
    return appts.map((appt) => ({
        id: appt._id.toString(),
        title: appt.patientId?.name ?? "Randevu",
        start: appt.start,
        end: appt.end,
        serviceId: appt.serviceId?.toString() ?? "",
        extendedProps: {
            employeeEmail: appt.employeeEmail ?? "",
            serviceId: appt.serviceId?.toString() ?? "",
            patientId: appt.patientId?._id?.toString?.() ?? appt.patientId?.toString?.() ?? "",
        },
        color: appt.status === "done"
            ? "#6b7280"
            : appt.status === "cancelled"
                ? "#ef4444"
                : "#3b82f6",
    }));
}
async function getAppointmentById(companyId, appointmentId) {
    const appt = await repo.findOne(companyId, appointmentId);
    if (!appt)
        throw new Error("Appointment not found");
    return {
        id: appt._id.toString(),
        title: appt.patientId?.name ?? "Randevu",
        start: appt.start,
        end: appt.end,
        serviceId: appt.serviceId?.toString() ?? "",
        extendedProps: {
            employeeEmail: appt.employeeEmail ?? "",
            serviceId: appt.serviceId?.toString() ?? "",
            patientId: appt.patientId?._id?.toString?.() ?? appt.patientId?.toString?.() ?? "",
        },
    };
}
async function createAppointment(companyId, dto, user) {
    const { patientId, employeeEmail, serviceId, start, end } = dto;
    const newStart = new Date(start), newEnd = new Date(end);
    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
        throw { status: 400, message: "Invalid datetime" };
    }
    // ✅ Pass companyId into findById
    const patient = await patientRepo.findById(companyId, patientId);
    if (!patient)
        throw { status: 404, message: "Patient not found" };
    if (patient.companyId.toString() !== companyId)
        throw { status: 403, message: "Patient not in this company" };
    // owner/employee check
    await repo.ensureUserIsEmployee(companyId, employeeEmail);
    if (patient.credit < 1)
        throw { status: 400, message: "Insufficient credit" };
    const overlap = await repo.findOverlap(companyId, employeeEmail, newStart, newEnd);
    if (overlap)
        throw { status: 409, message: "Timeslot taken" };
    // debit one credit
    patient.credit -= 1;
    await patient.save();
    return repo.create({
        companyId,
        patientId,
        employeeEmail,
        serviceId,
        start: newStart,
        end: newEnd,
        status: "scheduled",
    });
}
async function updateAppointment(companyId, appointmentId, dto) {
    const { start, end, serviceId, employeeEmail } = dto;
    const newStart = new Date(start), newEnd = new Date(end);
    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
        throw { status: 400, message: "Invalid datetime" };
    }
    return repo.updateById(companyId, appointmentId, {
        start: newStart,
        end: newEnd,
        serviceId,
        employeeEmail,
    });
}
async function deleteAppointment(companyId, appointmentId) {
    const appt = await repo.findOne(companyId, appointmentId);
    if (!appt)
        throw { status: 404, message: "Appointment not found" };
    // ✅ Pass companyId into findById here as well
    const patient = await patientRepo.findById(companyId, appt.patientId.toString());
    if (patient) {
        patient.credit += 1;
        await patient.save();
    }
    await repo.deleteById(companyId, appointmentId);
}
