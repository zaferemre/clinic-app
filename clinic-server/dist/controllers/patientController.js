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
exports.flagPatientCall = exports.getPatientAppointments = exports.getPatientById = exports.recordPayment = exports.deletePatient = exports.updatePatient = exports.getPatient = exports.createPatient = exports.listPatients = void 0;
const patientService = __importStar(require("../services/patientService"));
// List all patients in clinic
const listPatients = async (req, res, next) => {
    try {
        const patients = await patientService.getPatients(req.params.companyId, req.params.clinicId);
        res.json(patients);
    }
    catch (err) {
        next(err);
    }
};
exports.listPatients = listPatients;
// Create patient
const createPatient = async (req, res, next) => {
    try {
        const patient = await patientService.createPatient(req.params.companyId, req.params.clinicId, req.body);
        res.status(201).json(patient);
    }
    catch (err) {
        next(err);
    }
};
exports.createPatient = createPatient;
// Get one patient
const getPatient = async (req, res, next) => {
    try {
        const patient = await patientService.getPatientById(req.params.companyId, req.params.clinicId, req.params.patientId);
        res.json(patient);
    }
    catch (err) {
        next(err);
    }
};
exports.getPatient = getPatient;
exports.getPatientById = exports.getPatient;
// Update patient
const updatePatient = async (req, res, next) => {
    try {
        const updated = await patientService.updatePatient(req.params.companyId, req.params.clinicId, req.params.patientId, req.body);
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.updatePatient = updatePatient;
// Delete patient
const deletePatient = async (req, res, next) => {
    try {
        await patientService.deletePatient(req.params.companyId, req.params.clinicId, req.params.patientId);
        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
};
exports.deletePatient = deletePatient;
// Record payment for patient
const recordPayment = async (req, res, next) => {
    try {
        const record = await patientService.recordPayment(req.params.companyId, req.params.clinicId, req.params.patientId, req.body);
        res.status(201).json(record);
    }
    catch (err) {
        next(err);
    }
};
exports.recordPayment = recordPayment;
// --- NEW/COMPLETE:
const getPatientAppointments = async (req, res, next) => {
    try {
        const appts = await patientService.getPatientAppointments(req.params.companyId, req.params.clinicId, req.params.patientId);
        res.json(appts);
    }
    catch (err) {
        next(err);
    }
};
exports.getPatientAppointments = getPatientAppointments;
const flagPatientCall = async (req, res, next) => {
    try {
        const flagged = await patientService.flagPatientCall(req.params.companyId, req.params.clinicId, req.params.patientId, req.body.flagType ?? "called");
        res.json(flagged);
    }
    catch (err) {
        next(err);
    }
};
exports.flagPatientCall = flagPatientCall;
