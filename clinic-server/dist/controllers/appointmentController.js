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
exports.deleteAppointment = exports.updateAppointment = exports.createAppointment = exports.getAppointmentById = exports.getAppointments = void 0;
const appointmentService = __importStar(require("../services/appointmentService"));
const getAppointments = async (req, res, next) => {
    try {
        const { companyId, clinicId } = req.params;
        const filters = {
            employeeId: req.query.employeeId,
            patientId: req.query.patientId,
            groupId: req.query.groupId,
        };
        const events = await appointmentService.getAppointments(companyId, clinicId, filters);
        res.status(200).json(events);
    }
    catch (err) {
        next(err);
    }
};
exports.getAppointments = getAppointments;
const getAppointmentById = async (req, res, next) => {
    try {
        const { companyId, clinicId, appointmentId } = req.params;
        const dto = await appointmentService.getAppointmentById(companyId, clinicId, appointmentId);
        res.status(200).json(dto);
    }
    catch (err) {
        next(err);
    }
};
exports.getAppointmentById = getAppointmentById;
const createAppointment = async (req, res, next) => {
    try {
        const { companyId, clinicId } = req.params;
        const user = req.user;
        const { patientId, groupId, employeeId, serviceId, start, end } = req.body;
        if (!employeeId || !serviceId || !start || !end) {
            res.status(400).json({
                message: "employeeId, serviceId, start, and end are required.",
            });
            return;
        }
        const appointmentType = groupId ? "group" : "individual";
        const created = await appointmentService.createAppointment(companyId, clinicId, {
            patientId,
            groupId,
            employeeId,
            serviceId,
            start,
            end,
            appointmentType,
        }, user);
        res.status(201).json(created);
    }
    catch (err) {
        next(err);
    }
};
exports.createAppointment = createAppointment;
const updateAppointment = async (req, res, next) => {
    try {
        const { companyId, clinicId, appointmentId } = req.params;
        const updates = { ...req.body };
        if ("groupId" in updates) {
            updates.appointmentType = updates.groupId ? "group" : "individual";
        }
        const updated = await appointmentService.updateAppointment(companyId, clinicId, appointmentId, updates);
        res.status(200).json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.updateAppointment = updateAppointment;
const deleteAppointment = async (req, res, next) => {
    try {
        const { companyId, clinicId, appointmentId } = req.params;
        await appointmentService.deleteAppointment(companyId, clinicId, appointmentId);
        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
};
exports.deleteAppointment = deleteAppointment;
