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
exports.deleteAppointment = exports.updateAppointment = exports.createAppointment = exports.getAppointment = exports.listAppointments = void 0;
const appointmentService = __importStar(require("../services/appointmentService"));
// List all appointments
const listAppointments = async (req, res, next) => {
    try {
        const filters = {};
        if (req.query.employeeId)
            filters.employeeId = req.query.employeeId;
        if (req.query.patientId)
            filters.patientId = req.query.patientId;
        if (req.query.groupId)
            filters.groupId = req.query.groupId;
        const appointments = await appointmentService.getAppointments(req.params.companyId, req.params.clinicId, filters);
        res.json(appointments);
    }
    catch (err) {
        next(err);
    }
};
exports.listAppointments = listAppointments;
// Get a single appointment
const getAppointment = async (req, res, next) => {
    try {
        const appointment = await appointmentService.getAppointmentById(req.params.companyId, req.params.clinicId, req.params.appointmentId);
        if (!appointment) {
            res.status(404).json({ error: "Not found" });
            return;
        }
        res.json(appointment);
    }
    catch (err) {
        next(err);
    }
};
exports.getAppointment = getAppointment;
// Create new appointment
const createAppointment = async (req, res, next) => {
    try {
        const uid = req.user?.uid;
        if (!uid) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const created = await appointmentService.createAppointment(req.params.companyId, req.params.clinicId, req.body, // contains employeeId = Firebase UID
        uid);
        res.status(201).json(created);
    }
    catch (err) {
        next(err);
    }
};
exports.createAppointment = createAppointment;
// Update appointment
const updateAppointment = async (req, res, next) => {
    try {
        const updated = await appointmentService.updateAppointment(req.params.companyId, req.params.clinicId, req.params.appointmentId, req.body);
        if (!updated) {
            res.status(404).json({ error: "Not found" });
            return;
        }
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.updateAppointment = updateAppointment;
// Delete appointment
const deleteAppointment = async (req, res, next) => {
    try {
        const deleted = await appointmentService.deleteAppointment(req.params.companyId, req.params.clinicId, req.params.appointmentId);
        if (!deleted) {
            res.status(404).json({ error: "Not found" });
            return;
        }
        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
};
exports.deleteAppointment = deleteAppointment;
