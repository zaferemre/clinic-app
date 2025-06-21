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
exports.createPatient = createPatient;
exports.getPatients = getPatients;
exports.getPatientById = getPatientById;
exports.updatePatient = updatePatient;
exports.recordPayment = recordPayment;
exports.getPatientAppointments = getPatientAppointments;
exports.flagPatientCall = flagPatientCall;
exports.getNotifications = getNotifications;
exports.markPatientCalled = markPatientCalled;
exports.deletePatient = deletePatient;
// src/services/patientService.ts
const mongoose_1 = require("mongoose");
const http_errors_1 = __importDefault(require("http-errors"));
const repoPat = __importStar(require("../dataAccess/patientRepository"));
const apptRepo = __importStar(require("../dataAccess/appointmentRepository"));
const notifRepo = __importStar(require("../dataAccess/notificationRepository"));
/** Create a new patient under a company & clinic. */
async function createPatient(companyId, clinicId, data) {
    const doc = {
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
        ...data,
        credit: typeof data.credit === "number" ? data.credit : 0,
    };
    console.log("Creating patient with:", doc);
    return repoPat.createPatient(doc);
}
/** List patients for a company & clinic */
async function getPatients(companyId, clinicId) {
    return repoPat.listPatients(companyId, clinicId);
}
/** Get one patient by ID */
async function getPatientById(companyId, clinicId, patientId) {
    const patient = await repoPat.findPatientById(companyId, clinicId, patientId);
    if (!patient)
        throw (0, http_errors_1.default)(404, "Patient not found");
    return patient;
}
/** Update patient fields */
async function updatePatient(companyId, clinicId, patientId, updates) {
    return repoPat.updatePatientById(patientId, updates);
}
/** Record a payment in the patient’s history */
async function recordPayment(companyId, clinicId, patientId, entry) {
    return repoPat.addPaymentHistory(companyId, clinicId, patientId, entry);
}
/** List a patient’s appointments */
async function getPatientAppointments(companyId, clinicId, patientId) {
    return apptRepo.listAppointments(companyId, clinicId, {
        patientId: new mongoose_1.Types.ObjectId(patientId),
    });
}
/** Flag a patient for a call (creates a notification) */
async function flagPatientCall(companyId, clinicId, patientId, note, workerId) {
    const doc = {
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
        patientId: new mongoose_1.Types.ObjectId(patientId),
        type: "call",
        status: "pending",
        message: `Flagged patient call${note ? ": " + note : ""}`,
        trigger: "patient-call",
        createdBy: new mongoose_1.Types.ObjectId(workerId),
        note,
    };
    return notifRepo.createNotification(doc);
}
/** List notifications for company & clinic */
async function getNotifications(companyId, clinicId) {
    return notifRepo.listNotifications(companyId, clinicId);
}
/** Mark a notification as done */
async function markPatientCalled(companyId, clinicId, notificationId) {
    return notifRepo.updateNotificationStatus(notificationId, "done");
}
/** Delete a patient record */
async function deletePatient(companyId, clinicId, patientId) {
    return repoPat.deletePatientById(patientId);
}
