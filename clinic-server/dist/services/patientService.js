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
const repo = __importStar(require("../dataAccess/patientRepository"));
const apptRepo = __importStar(require("../dataAccess/appointmentRepository"));
const notifRepo = __importStar(require("../dataAccess/notificationRepository"));
const http_errors_1 = __importDefault(require("http-errors"));
async function createPatient(companyId, dto) {
    return repo.create({
        ...dto,
        companyId,
        credit: 0,
        paymentHistory: dto.paymentHistory ?? [],
    });
}
async function getPatients(companyId) {
    return repo.findByCompany(companyId);
}
// ← new
async function getPatientById(companyId, patientId) {
    const patient = await repo.findById(companyId, patientId);
    if (!patient)
        throw (0, http_errors_1.default)(404, "Patient not found");
    return patient;
}
async function updatePatient(companyId, patientId, updates) {
    return repo.updateById(companyId, patientId, updates);
}
async function recordPayment(companyId, patientId, body) {
    const { method, amount, note } = body;
    return repo.recordPayment(companyId, patientId, { method, amount, note });
}
async function getPatientAppointments(companyId, patientId) {
    return apptRepo.findByPatient(companyId, patientId);
}
async function flagPatientCall(companyId, patientId, note, workerEmail) {
    return notifRepo.create({
        companyId,
        patientId,
        type: "call",
        status: "pending",
        workerEmail,
        note,
    });
}
async function getNotifications(companyId) {
    return notifRepo.findPendingByCompany(companyId);
}
async function markPatientCalled(companyId, notificationId) {
    return notifRepo.markDone(companyId, notificationId);
}
async function deletePatient(companyId, patientId) {
    return repo.deleteById(companyId, patientId);
}
