"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAppointments = listAppointments;
exports.listEmployeeAppointmentsForDay = listEmployeeAppointmentsForDay;
exports.findAppointmentById = findAppointmentById;
exports.createAppointment = createAppointment;
exports.updateAppointmentById = updateAppointmentById;
exports.deleteAppointmentById = deleteAppointmentById;
// src/dataAccess/appointmentRepository.ts
const Appointment_1 = __importDefault(require("../models/Appointment"));
const mongoose_1 = require("mongoose");
async function listAppointments(companyId, clinicId, filter = {}) {
    return Appointment_1.default.find({
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
        ...filter,
    }).exec();
}
async function listEmployeeAppointmentsForDay(companyId, clinicId, employeeId, day) {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    return Appointment_1.default.find({
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
        employeeId: new mongoose_1.Types.ObjectId(employeeId),
        start: { $lt: dayEnd },
        end: { $gt: dayStart },
        status: { $ne: "cancelled" },
    }).exec();
}
async function findAppointmentById(companyId, clinicId, appointmentId) {
    return Appointment_1.default.findOne({
        _id: new mongoose_1.Types.ObjectId(appointmentId),
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
    }).exec();
}
async function createAppointment(doc) {
    return Appointment_1.default.create(doc);
}
async function updateAppointmentById(appointmentId, updates) {
    return Appointment_1.default.findByIdAndUpdate(appointmentId, updates, {
        new: true,
    }).exec();
}
async function deleteAppointmentById(appointmentId) {
    return Appointment_1.default.findByIdAndDelete(appointmentId).exec();
}
