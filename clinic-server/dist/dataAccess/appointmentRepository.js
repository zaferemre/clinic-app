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
exports.findOverlap = findOverlap;
const Appointment_1 = __importDefault(require("../models/Appointment"));
const mongoose_1 = require("mongoose");
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
function createAppointment(doc // or: AppointmentCreationAttrs if you want strong typing
) {
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
function findOverlap(companyId, employeeId, start, end) {
    return Appointment_1.default.findOne({
        companyId: new mongoose_1.Types.ObjectId(companyId),
        employeeId: new mongoose_1.Types.ObjectId(employeeId),
        $or: [
            { start: { $lt: end, $gte: start } },
            { end: { $gt: start, $lte: end } },
            { start: { $lte: start }, end: { $gte: end } },
        ],
    }).exec();
}
