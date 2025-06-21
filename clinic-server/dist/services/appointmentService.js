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
const repo = __importStar(require("../dataAccess/appointmentRepository"));
const patientRepo = __importStar(require("../dataAccess/patientRepository"));
const serviceRepo = __importStar(require("../dataAccess/serviceRepository"));
const http_errors_1 = __importDefault(require("http-errors"));
const mongoose_1 = require("mongoose");
const Employee_1 = __importDefault(require("../models/Employee"));
// Helper to create ObjectId only from valid strings
function safeObjectId(val) {
    if (typeof val === "string" && val.length === 24)
        return new mongoose_1.Types.ObjectId(val);
    return undefined;
}
async function getAppointments(companyId, clinicId, filters) {
    // build your mongo filter obj as before…
    const filterObj = {};
    if (filters.employeeId)
        filterObj.employeeId = new mongoose_1.Types.ObjectId(filters.employeeId);
    if (filters.patientId)
        filterObj.patientId = new mongoose_1.Types.ObjectId(filters.patientId);
    if (filters.groupId)
        filterObj.groupId = new mongoose_1.Types.ObjectId(filters.groupId);
    const docs = await repo.listAppointments(companyId, clinicId, filterObj);
    const now = new Date();
    return docs.map((doc) => {
        const dto = mapDoc(doc);
        // compute “status” on the fly:
        dto.status = doc.end < now ? "done" : "scheduled";
        return dto;
    });
}
async function getAppointmentById(companyId, clinicId, appointmentId) {
    const doc = await repo.findAppointmentById(companyId, clinicId, appointmentId);
    if (!doc)
        throw (0, http_errors_1.default)(404, "Appointment not found");
    const dto = mapDoc(doc);
    dto.status = doc.end < new Date() ? "done" : "scheduled";
    return dto;
}
async function createAppointment(companyId, clinicId, dto, user) {
    const { patientId, groupId, employeeId, serviceId, start, end, appointmentType, } = dto;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw (0, http_errors_1.default)(400, "Invalid start/end dates");
    }
    // ensure service exists
    const svc = (await serviceRepo.findById?.(companyId, clinicId, serviceId)) ||
        (await serviceRepo.findServiceById?.(companyId, clinicId, serviceId)); // Support both function names
    if (!svc)
        throw (0, http_errors_1.default)(404, "Service not found");
    // Resolve employeeId (allow passing email)
    let employeeObjectId;
    if (employeeId.includes("@")) {
        const emp = await Employee_1.default.findOne({
            email: employeeId,
            companyId: safeObjectId(companyId),
            clinicId: safeObjectId(clinicId),
        });
        if (!emp)
            throw (0, http_errors_1.default)(404, "Çalışan bulunamadı");
        employeeObjectId = emp._id;
    }
    else {
        employeeObjectId = safeObjectId(employeeId);
        if (!employeeObjectId)
            throw (0, http_errors_1.default)(400, "Geçersiz çalışan ID");
    }
    // optional patient credit check
    if (patientId) {
        const patient = (await patientRepo.findById?.(companyId, clinicId, patientId)) ||
            (await patientRepo.findPatientById?.(companyId, clinicId, patientId));
        if (!patient)
            throw (0, http_errors_1.default)(404, "Patient not found");
        if ((patient.credit ?? 0) < 1)
            throw (0, http_errors_1.default)(400, "Insufficient credit");
        patient.credit = (patient.credit ?? 0) - 1;
        await patient.save();
    }
    // check overlap
    const conflict = await repo.findOverlap(companyId, employeeObjectId.toHexString(), startDate, endDate);
    if (conflict)
        throw (0, http_errors_1.default)(409, "Time slot conflict");
    // FINAL LOG (optional, remove if not needed)
    console.log({
        companyId,
        clinicId,
        patientId,
        groupId,
        employeeId,
        employeeObjectId,
        serviceId,
        createdBy: user.uid,
        startDate,
        endDate,
        appointmentType,
    });
    // CREATE the appointment
    const created = await repo.createAppointment({
        companyId: safeObjectId(companyId),
        clinicId: safeObjectId(clinicId),
        patientId: safeObjectId(patientId),
        groupId: safeObjectId(groupId),
        employeeId: employeeObjectId, // always an ObjectId now!
        serviceId: safeObjectId(serviceId),
        start: startDate,
        end: endDate,
        status: "scheduled",
        appointmentType,
        createdBy: user.uid, // always string!
    });
    return mapDoc(created);
}
async function updateAppointment(companyId, clinicId, appointmentId, updates) {
    const up = {};
    if (updates.start)
        up.start = new Date(updates.start);
    if (updates.end)
        up.end = new Date(updates.end);
    if (updates.serviceId)
        up.serviceId = new mongoose_1.Types.ObjectId(updates.serviceId);
    if (updates.employeeId)
        up.employeeId = new mongoose_1.Types.ObjectId(updates.employeeId);
    if ("groupId" in updates) {
        up.groupId = updates.groupId
            ? new mongoose_1.Types.ObjectId(updates.groupId)
            : undefined;
        up.appointmentType = updates.groupId ? "group" : "individual";
    }
    const updated = await repo.updateAppointmentById(appointmentId, up);
    if (!updated)
        throw (0, http_errors_1.default)(404, "Appointment not found");
    return mapDoc(updated);
}
async function deleteAppointment(companyId, clinicId, appointmentId) {
    const doc = await repo.findAppointmentById(companyId, clinicId, appointmentId);
    if (!doc)
        throw (0, http_errors_1.default)(404, "Appointment not found");
    if (doc.patientId) {
        const p = await patientRepo.findById(companyId, clinicId, doc.patientId.toHexString());
        if (p) {
            p.credit = (p.credit ?? 0) + 1;
            await p.save();
        }
    }
    await repo.deleteAppointmentById(appointmentId);
}
function mapDoc(a) {
    return {
        id: a._id?.toString?.() ?? "", // Defensive: handles possible proxy objects
        patientId: a.patientId ? a.patientId.toString() : undefined,
        groupId: a.groupId ? a.groupId.toString() : undefined,
        employeeId: a.employeeId ? a.employeeId.toString() : undefined,
        serviceId: a.serviceId ? a.serviceId.toString() : undefined,
        start: a.start,
        end: a.end,
        status: a.status,
        appointmentType: a.appointmentType,
        createdBy: a.createdBy ? a.createdBy.toString() : undefined,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
    };
}
