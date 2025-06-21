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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppointments = getAppointments;
exports.getAppointmentById = getAppointmentById;
exports.createAppointment = createAppointment;
exports.updateAppointment = updateAppointment;
exports.deleteAppointment = deleteAppointment;
const mongoose_1 = require("mongoose");
const repo = __importStar(require("../dataAccess/appointmentRepository"));
const patientRepo = __importStar(require("../dataAccess/patientRepository"));
const http_errors_1 = __importDefault(require("http-errors"));
// List appointments
async function getAppointments(companyId, clinicId, filters) {
    const filterObj = {};
    if (filters.employeeId)
        filterObj.employeeId = new mongoose_1.Types.ObjectId(filters.employeeId);
    if (filters.patientId)
        filterObj.patientId = new mongoose_1.Types.ObjectId(filters.patientId);
    if (filters.groupId)
        filterObj.groupId = new mongoose_1.Types.ObjectId(filters.groupId);
    const appts = (await repo.listAppointments(companyId, clinicId, filterObj));
    return appts.map((a) => ({
        id: a._id.toHexString(),
        patientId: a.patientId?.toHexString(),
        groupId: a.groupId?.toHexString(),
        employeeId: a.employeeId.toHexString(),
        serviceId: a.serviceId.toHexString(),
        start: a.start,
        end: a.end,
        status: a.status,
        appointmentType: a.appointmentType,
    }));
}
// Get one appointment
async function getAppointmentById(companyId, clinicId, appointmentId) {
    const a = (await repo.findAppointmentById(companyId, clinicId, appointmentId));
    if (!a)
        throw (0, http_errors_1.default)(404, "Appointment not found");
    return {
        id: a._id.toHexString(),
        patientId: a.patientId?.toHexString(),
        groupId: a.groupId?.toHexString(),
        employeeId: a.employeeId.toHexString(),
        serviceId: a.serviceId.toHexString(),
        start: a.start,
        end: a.end,
        status: a.status,
        appointmentType: a.appointmentType,
    };
}
// Create appointment
async function createAppointment(companyId, clinicId, dto, user) {
    const { patientId, groupId, employeeId, serviceId, start, end, appointmentType, } = dto;
    const newStart = new Date(start), newEnd = new Date(end);
    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime()))
        throw (0, http_errors_1.default)(400, "Invalid dates");
    if (patientId) {
        const p = await patientRepo.findPatientById(companyId, clinicId, patientId);
        if (!p)
            throw (0, http_errors_1.default)(404, "Patient not found");
        if (p.credit < 1)
            throw (0, http_errors_1.default)(400, "Insufficient credit");
        p.credit--;
        await p.save();
    }
    await repo.ensureUserIsEmployee(companyId, employeeId);
    const conflict = await repo.findOverlap(companyId, employeeId, newStart, newEnd);
    if (conflict)
        throw (0, http_errors_1.default)(409, "Timeslot conflict");
    const created = await repo.createAppointment({
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
        patientId: patientId ? new mongoose_1.Types.ObjectId(patientId) : undefined,
        groupId: groupId ? new mongoose_1.Types.ObjectId(groupId) : undefined,
        employeeId: new mongoose_1.Types.ObjectId(employeeId),
        serviceId: new mongoose_1.Types.ObjectId(serviceId),
        start: newStart,
        end: newEnd,
        status: "scheduled",
        appointmentType,
        createdBy: new mongoose_1.Types.ObjectId(user.uid),
    });
    return {
        id: created._id.toHexString(),
        patientId: created.patientId?.toHexString(),
        groupId: created.groupId?.toHexString(),
        employeeId: created.employeeId.toHexString(),
        serviceId: created.serviceId.toHexString(),
        start: created.start,
        end: created.end,
        status: created.status,
        appointmentType: created.appointmentType,
    };
}
// Update appointment
async function updateAppointment(companyId, clinicId, appointmentId, dto) {
    const updates = {};
    if (dto.start)
        updates.start = new Date(dto.start);
    if (dto.end)
        updates.end = new Date(dto.end);
    if (dto.serviceId)
        updates.serviceId = new mongoose_1.Types.ObjectId(dto.serviceId);
    if (dto.employeeId)
        updates.employeeId = new mongoose_1.Types.ObjectId(dto.employeeId);
    if ("groupId" in dto) {
        updates.groupId = dto.groupId ? new mongoose_1.Types.ObjectId(dto.groupId) : undefined;
        updates.appointmentType = dto.groupId ? "group" : "individual";
    }
    const updated = await repo.updateAppointmentById(appointmentId, updates);
    if (!updated)
        throw (0, http_errors_1.default)(404, "Appointment not found");
    return {
        id: updated._id.toHexString(),
        patientId: updated.patientId?.toHexString(),
        groupId: updated.groupId?.toHexString(),
        employeeId: updated.employeeId.toHexString(),
        serviceId: updated.serviceId.toHexString(),
        start: updated.start,
        end: updated.end,
        status: updated.status,
        appointmentType: updated.appointmentType,
    };
}
// Delete appointment
async function deleteAppointment(companyId, clinicId, appointmentId) {
    const a = await repo.findAppointmentById(companyId, clinicId, appointmentId);
    if (!a)
        throw (0, http_errors_1.default)(404, "Appointment not found");
    if (a.patientId) {
        const p = await patientRepo.findPatientById(companyId, clinicId, a.patientId.toHexString());
        if (p) {
            p.credit++;
            await p.save();
        }
    }
    await repo.deleteAppointmentById(appointmentId);
}
