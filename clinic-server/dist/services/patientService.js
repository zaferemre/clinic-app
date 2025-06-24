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
async function getPatients(companyId, clinicId) {
    return repoPat.listPatients(companyId, clinicId);
}
async function createPatient(companyId, clinicId, data) {
    const doc = {
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
        ...data,
        credit: typeof data.credit === "number" ? data.credit : 0,
    };
    return repoPat.createPatient(doc);
}
async function getPatientById(companyId, clinicId, patientId) {
    const patient = await repoPat.findPatientById(companyId, clinicId, patientId);
    if (!patient)
        throw (0, http_errors_1.default)(404, "Patient not found");
    return patient;
}
async function updatePatient(companyId, clinicId, patientId, updates) {
    return repoPat.updatePatientById(patientId, updates);
}
async function deletePatient(companyId, clinicId, patientId) {
    return repoPat.deletePatientById(patientId);
}
async function recordPayment(companyId, clinicId, patientId, entry) {
    return repoPat.addPaymentHistory(companyId, clinicId, patientId, entry);
}
async function getPatientAppointments(companyId, clinicId, patientId) {
    return repoPat.getPatientAppointments(companyId, clinicId, patientId);
}
async function flagPatientCall(companyId, clinicId, patientId, flagType) {
    // You could expand this for different flag types in the future
    return repoPat.flagPatientCall(companyId, clinicId, patientId, flagType);
}
