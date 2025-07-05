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
const mongoose_1 = require("mongoose");
const cacheHelpers_1 = require("../utils/cacheHelpers");
/**
 * List appointments with optional filters (cache key includes filters)
 */
async function getAppointments(companyId, clinicId, filters = {}) {
    const filtersKey = JSON.stringify(filters);
    const cacheKey = `appointments:${companyId}:${clinicId}:${filtersKey}`;
    return (0, cacheHelpers_1.getOrSetCache)(cacheKey, () => repo.listAppointments(companyId, clinicId, filters));
}
/**
 * Get single appointment by ID
 */
async function getAppointmentById(companyId, clinicId, appointmentId) {
    const cacheKey = `appointment:${appointmentId}`;
    return (0, cacheHelpers_1.getOrSetCache)(cacheKey, () => repo.findAppointmentById(companyId, clinicId, appointmentId));
}
/**
 * Create a new appointment.
 *   - We only decrement the patient's credit if it's > 0.
 */
async function createAppointment(companyId, clinicId, data, // must include data.patientId
createdByUid) {
    const doc = {
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
        ...data,
        createdBy: createdByUid,
    };
    // 1) create the appointment
    const appt = await repo.createAppointment(doc);
    // 2) decrement the patient’s credit by 1, but only if current credit > 0
    if (data.patientId) {
        const pid = data.patientId.toString();
        const patient = await patientRepo.findPatientById(companyId, clinicId, pid);
        if (patient && typeof patient.credit === "number" && patient.credit > 0) {
            await patientRepo.updatePatientById(pid, { $inc: { credit: -1 } });
        }
    }
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
 * Delete an appointment.
 *   - We always restore 1 credit back to the patient.
 */
async function deleteAppointment(companyId, clinicId, appointmentId) {
    // 1) fetch appointment so we know its patientId
    const toDelete = await repo.findAppointmentById(companyId, clinicId, appointmentId);
    // 2) delete the appointment
    const deleted = await repo.deleteAppointmentById(appointmentId);
    // 3) give the patient back 1 credit
    if (toDelete?.patientId) {
        const pid = toDelete.patientId.toString();
        await patientRepo.updatePatientById(pid, { $inc: { credit: 1 } });
    }
    // 4) invalidate caches
    await (0, cacheHelpers_1.invalidateCache)(`appointment:${appointmentId}`);
    await (0, cacheHelpers_1.invalidateCache)(`appointments:${companyId}:${clinicId}:${JSON.stringify({})}`);
    return deleted;
}
