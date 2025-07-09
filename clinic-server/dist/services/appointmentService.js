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
exports.getEmployeeBusySlots = getEmployeeBusySlots;
exports.getAppointmentById = getAppointmentById;
exports.createAppointment = createAppointment;
exports.updateAppointment = updateAppointment;
exports.deleteAppointment = deleteAppointment;
// src/services/appointmentService.ts
const repo = __importStar(require("../dataAccess/appointmentRepository"));
const patientRepo = __importStar(require("../dataAccess/patientRepository"));
const mongoose_1 = require("mongoose");
const cacheHelpers_1 = require("../utils/cacheHelpers");
const notificationService_1 = require("./notificationService");
const employeeRepo = __importStar(require("../dataAccess/employeeRepository"));
/**
 * List appointments with optional filters
 */
async function getAppointments(companyId, clinicId, filters = {}) {
    const filtersKey = JSON.stringify(filters);
    const cacheKey = `appointments:${companyId}:${clinicId}:${filtersKey}`;
    return (0, cacheHelpers_1.getOrSetCache)(cacheKey, () => repo.listAppointments(companyId, clinicId, filters));
}
/**
 * Get appointments for a specific employee and day (busy slots)
 */
async function getEmployeeBusySlots(companyId, clinicId, employeeId, day) {
    // no cache for busy slots, always live
    return repo.listEmployeeAppointmentsForDay(companyId, clinicId, employeeId, day);
}
/**
 * Get single appointment by ID
 */
async function getAppointmentById(companyId, clinicId, appointmentId) {
    const cacheKey = `appointment:${appointmentId}`;
    return (0, cacheHelpers_1.getOrSetCache)(cacheKey, () => repo.findAppointmentById(companyId, clinicId, appointmentId));
}
/**
 * Create a new appointment (supports individual, group, custom)
 */
async function createAppointment(companyId, clinicId, data, createdByUid) {
    const doc = {
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
        ...data,
        createdBy: createdByUid,
    };
    // 1) create the appointment
    const appt = await repo.createAppointment(doc);
    // 2) decrement the patient’s credit by 1, only for individual with patientId and > 0
    if (appt.appointmentType === "individual" && data.patientId) {
        const pid = data.patientId.toString();
        const patient = await patientRepo.findPatientById(companyId, clinicId, pid);
        if (patient && typeof patient.credit === "number" && patient.credit > 0) {
            await patientRepo.updatePatientById(pid, { $inc: { credit: -1 } });
        }
    }
    // >>>>>>>>>>>> NEW: Notify assigned employee if different from creator
    if (appt.employeeId) {
        const emp = await employeeRepo.findEmployeeById(companyId, clinicId, appt.employeeId.toString());
        // employee object may look like { _id, userUid, ... }
        if (emp && emp.userUid && emp.userUid !== createdByUid) {
            // Send notification to this employee
            await (0, notificationService_1.createNotification)(companyId, clinicId, {
                type: "system",
                status: "pending",
                title: "Yeni Randevu",
                message: `Siz atandınız: ${appt.start.toLocaleString()} randevusu oluşturuldu.`,
                workerUid: emp.userUid, // the employee's userUid
                targetUserId: emp.userUid, // for push delivery
                priority: "normal",
                meta: { appointmentId: appt._id },
            });
        }
    }
    // <<<<<<<<<<<<<
    // 3) invalidate the appointment list cache for this clinic/company
    await (0, cacheHelpers_1.invalidateCache)(`appointments:${companyId}:${clinicId}:${JSON.stringify({})}`);
    return appt;
}
/**
 * Update an appointment
 */
async function updateAppointment(companyId, clinicId, appointmentId, updates) {
    const updated = await repo.updateAppointmentById(appointmentId, updates);
    await (0, cacheHelpers_1.invalidateCache)(`appointment:${appointmentId}`);
    await (0, cacheHelpers_1.invalidateCache)(`appointments:${companyId}:${clinicId}:${JSON.stringify({})}`);
    return updated;
}
/**
 * Delete an appointment. Restore credit if applicable.
 */
async function deleteAppointment(companyId, clinicId, appointmentId) {
    // fetch appointment for patientId
    const toDelete = await repo.findAppointmentById(companyId, clinicId, appointmentId);
    const deleted = await repo.deleteAppointmentById(appointmentId);
    // restore credit if patientId and individual
    if (toDelete?.appointmentType === "individual" && toDelete?.patientId) {
        const pid = toDelete.patientId.toString();
        await patientRepo.updatePatientById(pid, { $inc: { credit: 1 } });
    }
    await (0, cacheHelpers_1.invalidateCache)(`appointment:${appointmentId}`);
    await (0, cacheHelpers_1.invalidateCache)(`appointments:${companyId}:${clinicId}:${JSON.stringify({})}`);
    return deleted;
}
