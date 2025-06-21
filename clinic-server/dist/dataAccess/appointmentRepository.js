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
exports.ensureUserIsEmployee = ensureUserIsEmployee;
exports.findOverlap = findOverlap;
const Appointment_1 = __importDefault(require("../models/Appointment"));
const mongoose_1 = require("mongoose");
// Filter object can be {} or with fields (employeeId, patientId, groupId)
function listAppointments(companyId, clinicId, filter = {}) {
    return Appointment_1.default.find({
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
        ...filter,
    }).exec();
}
function findAppointmentById(companyId, clinicId, appointmentId) {
    return Appointment_1.default.findOne({
        _id: new mongoose_1.Types.ObjectId(appointmentId),
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
    }).exec();
}
function createAppointment(doc) {
    return Appointment_1.default.create(doc);
}
function updateAppointmentById(appointmentId, updates) {
    return Appointment_1.default.findByIdAndUpdate(appointmentId, updates, {
        new: true,
    }).exec();
}
function deleteAppointmentById(appointmentId) {
    return Appointment_1.default.findByIdAndDelete(appointmentId).exec();
}
async function ensureUserIsEmployee(companyId, employeeId) {
    // Implement your employee check logic here (companyId + employeeId)
    // If not found, throw an error
    return;
}
async function findOverlap(companyId, employeeId, start, end) {
    // Find if an overlapping appointment exists
    return Appointment_1.default.findOne({
        companyId: new mongoose_1.Types.ObjectId(companyId),
        employeeId: new mongoose_1.Types.ObjectId(employeeId),
        $or: [{ start: { $lt: end }, end: { $gt: start } }],
    }).exec();
}
