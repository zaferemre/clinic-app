"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAppointments = listAppointments;
exports.findAppointmentById = findAppointmentById;
exports.createAppointment = createAppointment;
exports.updateAppointmentById = updateAppointmentById;
exports.deleteAppointmentById = deleteAppointmentById;
exports.listAppointmentsByUser = listAppointmentsByUser;
const Appointment_1 = __importDefault(require("../models/Appointment"));
const mongoose_1 = require("mongoose");
// List appointments, with optional filters
async function listAppointments(companyId, clinicId, filter = {}) {
    return Appointment_1.default.find({
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
        ...filter, // employeeId here is a string
    }).exec();
}
// Find single appointment by ID within company/clinic
async function findAppointmentById(companyId, clinicId, appointmentId) {
    return Appointment_1.default.findOne({
        _id: new mongoose_1.Types.ObjectId(appointmentId),
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
    }).exec();
}
// Create a new appointment
async function createAppointment(doc) {
    return Appointment_1.default.create(doc);
}
// Update an existing appointment by ID
async function updateAppointmentById(appointmentId, updates) {
    return Appointment_1.default.findByIdAndUpdate(appointmentId, updates, {
        new: true,
    }).exec();
}
// Delete an appointment by ID
async function deleteAppointmentById(appointmentId) {
    return Appointment_1.default.findByIdAndDelete(appointmentId).exec();
}
async function listAppointmentsByUser(userId) {
    return Appointment_1.default.find({ employeeId: userId }).exec();
}
