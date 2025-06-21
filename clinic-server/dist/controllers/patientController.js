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
exports.deletePatient = exports.flagPatientCall = exports.getPatientAppointments = exports.recordPayment = exports.updatePatient = exports.getPatientById = exports.listPatients = exports.createPatient = void 0;
const patientService = __importStar(require("../services/patientService"));
const createPatient = async (req, res, next) => {
    try {
        const { companyId, clinicId } = req.params;
        const created = await patientService.createPatient(companyId, clinicId, req.body);
        res.status(201).json(created);
    }
    catch (err) {
        next(err);
    }
};
exports.createPatient = createPatient;
const listPatients = async (req, res, next) => {
    try {
        const { companyId, clinicId } = req.params;
        const patients = await patientService.getPatients(companyId, clinicId);
        res.status(200).json(patients);
    }
    catch (err) {
        next(err);
    }
};
exports.listPatients = listPatients;
const getPatientById = async (req, res, next) => {
    try {
        const { companyId, clinicId, patientId } = req.params;
        const patient = await patientService.getPatientById(companyId, clinicId, patientId);
        res.status(200).json(patient);
    }
    catch (err) {
        next(err);
    }
};
exports.getPatientById = getPatientById;
const updatePatient = async (req, res, next) => {
    try {
        const { companyId, clinicId, patientId } = req.params;
        const updated = await patientService.updatePatient(companyId, clinicId, patientId, req.body);
        res.status(200).json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.updatePatient = updatePatient;
// **Removed the extra `user.uid`**—your service only takes 4 args
const recordPayment = async (req, res, next) => {
    try {
        const { companyId, clinicId, patientId } = req.params;
        const record = await patientService.recordPayment(companyId, clinicId, patientId, req.body);
        res.status(201).json(record);
    }
    catch (err) {
        next(err);
    }
};
exports.recordPayment = recordPayment;
const getPatientAppointments = async (req, res, next) => {
    try {
        const { companyId, clinicId, patientId } = req.params;
        const appts = await patientService.getPatientAppointments(companyId, clinicId, patientId);
        res.status(200).json(appts);
    }
    catch (err) {
        next(err);
    }
};
exports.getPatientAppointments = getPatientAppointments;
const flagPatientCall = async (req, res, next) => {
    try {
        const { companyId, clinicId, patientId } = req.params;
        const user = req.user;
        const notif = await patientService.flagPatientCall(companyId, clinicId, patientId, req.body.note ?? "", user.uid);
        res.status(201).json(notif);
    }
    catch (err) {
        next(err);
    }
};
exports.flagPatientCall = flagPatientCall;
const deletePatient = async (req, res, next) => {
    try {
        const { companyId, clinicId, patientId } = req.params;
        await patientService.deletePatient(companyId, clinicId, patientId);
        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
};
exports.deletePatient = deletePatient;
