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
exports.deletePatient = exports.markPatientCalled = exports.getNotifications = exports.flagPatientCall = exports.getPatientAppointments = exports.recordPayment = exports.updatePatient = exports.getPatients = exports.createPatient = void 0;
const patientService = __importStar(require("../services/patientService"));
const createPatient = async (req, res, next) => {
    try {
        const pat = await patientService.createPatient(req.params.companyId, req.body);
        res.status(201).json(pat);
    }
    catch (err) {
        next(err);
    }
};
exports.createPatient = createPatient;
const getPatients = async (req, res, next) => {
    try {
        const list = await patientService.getPatients(req.params.companyId);
        res.status(200).json(list);
    }
    catch (err) {
        next(err);
    }
};
exports.getPatients = getPatients;
const updatePatient = async (req, res, next) => {
    try {
        const updated = await patientService.updatePatient(req.params.companyId, req.params.patientId, req.body);
        res.status(200).json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.updatePatient = updatePatient;
const recordPayment = async (req, res, next) => {
    try {
        const updated = await patientService.recordPayment(req.params.companyId, req.params.patientId, req.body);
        res.status(200).json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.recordPayment = recordPayment;
const getPatientAppointments = async (req, res, next) => {
    try {
        const appts = await patientService.getPatientAppointments(req.params.companyId, req.params.patientId);
        res.status(200).json(appts);
    }
    catch (err) {
        next(err);
    }
};
exports.getPatientAppointments = getPatientAppointments;
const flagPatientCall = async (req, res, next) => {
    try {
        const notif = await patientService.flagPatientCall(req.params.companyId, req.params.patientId, req.body.note, req.user.email);
        res.status(201).json(notif);
    }
    catch (err) {
        next(err);
    }
};
exports.flagPatientCall = flagPatientCall;
const getNotifications = async (req, res, next) => {
    try {
        const list = await patientService.getNotifications(req.params.companyId);
        res.status(200).json(list);
    }
    catch (err) {
        next(err);
    }
};
exports.getNotifications = getNotifications;
const markPatientCalled = async (req, res, next) => {
    try {
        await patientService.markPatientCalled(req.params.companyId, req.params.notificationId);
        res.status(200).json({ message: "Notification marked done" });
    }
    catch (err) {
        next(err);
    }
};
exports.markPatientCalled = markPatientCalled;
const deletePatient = async (req, res, next) => {
    try {
        await patientService.deletePatient(req.params.companyId, req.params.patientId);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.deletePatient = deletePatient;
