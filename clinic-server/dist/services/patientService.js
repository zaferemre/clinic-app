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
exports.getPatients = getPatients;
exports.createPatient = createPatient;
exports.getPatientById = getPatientById;
exports.updatePatient = updatePatient;
exports.deletePatient = deletePatient;
exports.recordPayment = recordPayment;
exports.getPatientAppointments = getPatientAppointments;
exports.flagPatientCall = flagPatientCall;
const repoPat = __importStar(require("../dataAccess/patientRepository"));
const http_errors_1 = __importDefault(require("http-errors"));
const mongoose_1 = require("mongoose");
const cacheHelpers_1 = require("../utils/cacheHelpers");
/**
 * Get all patients for a company and clinic (with caching)
 */
async function getPatients(companyId, clinicId) {
    const cacheKey = `patients:${companyId}:${clinicId}`;
    return (0, cacheHelpers_1.getOrSetCache)(cacheKey, () => repoPat.listPatients(companyId, clinicId));
}
/**
 * Create a new patient and invalidate the patient list cache
 */
async function createPatient(companyId, clinicId, data) {
    const doc = {
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
        ...data,
        credit: typeof data.credit === "number" ? data.credit : 0,
        kvkkAccepted: data.kvkkAccepted ?? true,
        kvkkAcceptedAt: data.kvkkAcceptedAt ?? new Date(),
        clinicKvkkAccepted: data.clinicKvkkAccepted,
        clinicKvkkAcceptedAt: data.clinicKvkkAcceptedAt,
        clinicKvkkVersionAtAccept: data.clinicKvkkVersionAtAccept,
    };
    const created = await repoPat.createPatient(doc);
    await (0, cacheHelpers_1.invalidateCache)(`patients:${companyId}:${clinicId}`);
    return created;
}
/**
 * Get a single patient by ID
 */
async function getPatientById(companyId, clinicId, patientId) {
    const patient = await repoPat.findPatientById(companyId, clinicId, patientId);
    if (!patient)
        throw (0, http_errors_1.default)(404, "Patient not found");
    return patient;
}
/**
 * Update a patient and invalidate the patient list cache
 */
async function updatePatient(companyId, clinicId, patientId, updates) {
    const updated = await repoPat.updatePatientById(patientId, updates);
    await (0, cacheHelpers_1.invalidateCache)(`patients:${companyId}:${clinicId}`);
    return updated;
}
/**
 * Delete a patient and invalidate the patient list cache
 */
async function deletePatient(companyId, clinicId, patientId) {
    const deleted = await repoPat.deletePatientById(patientId);
    await (0, cacheHelpers_1.invalidateCache)(`patients:${companyId}:${clinicId}`);
    return deleted;
}
/**
 * Add a payment entry for the patient (invalidate patient list if you want)
 */
async function recordPayment(companyId, clinicId, patientId, entry) {
    const updated = await repoPat.addPaymentHistory(companyId, clinicId, patientId, entry);
    await (0, cacheHelpers_1.invalidateCache)(`patients:${companyId}:${clinicId}`); // Optional: invalidate cache if payment info is surfaced in the list
    return updated;
}
/**
 * Get all appointments for a patient (no cache here, can add if needed)
 */
async function getPatientAppointments(companyId, clinicId, patientId) {
    return repoPat.getPatientAppointments(companyId, clinicId, patientId);
}
/**
 * Flag a patient for a call (no cache, but could invalidate if flag info is in list)
 */
async function flagPatientCall(companyId, clinicId, patientId, flagType) {
    const flagged = await repoPat.flagPatientCall(companyId, clinicId, patientId, flagType);
    await (0, cacheHelpers_1.invalidateCache)(`patients:${companyId}:${clinicId}`); // Optional, as above
    return flagged;
}
