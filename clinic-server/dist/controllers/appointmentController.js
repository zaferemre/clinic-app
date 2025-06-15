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
        const events = await appointmentService.getAppointments(req.params.companyId);
        res.status(200).json(events);
    }
    catch (err) {
        next(err);
    }
};
exports.getAppointments = getAppointments;
const getAppointmentById = async (req, res, next) => {
    try {
        const dto = await appointmentService.getAppointmentById(req.params.companyId, req.params.appointmentId);
        res.status(200).json(dto);
    }
    catch (err) {
        next(err);
    }
};
exports.getAppointmentById = getAppointmentById;
const createAppointment = async (req, res, next) => {
    try {
        const created = await appointmentService.createAppointment(req.params.companyId, req.body, req.user);
        res.status(201).json(created);
    }
    catch (err) {
        next(err);
    }
};
exports.createAppointment = createAppointment;
const updateAppointment = async (req, res, next) => {
    try {
        const updated = await appointmentService.updateAppointment(req.params.companyId, req.params.appointmentId, req.body);
        res.status(200).json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.updateAppointment = updateAppointment;
const deleteAppointment = async (req, res, next) => {
    try {
        await appointmentService.deleteAppointment(req.params.companyId, req.params.appointmentId);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.deleteAppointment = deleteAppointment;
