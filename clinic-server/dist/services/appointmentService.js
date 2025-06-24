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
exports.getAppointments = getAppointments;
exports.getAppointmentById = getAppointmentById;
exports.createAppointment = createAppointment;
exports.updateAppointment = updateAppointment;
exports.deleteAppointment = deleteAppointment;
exports.getAppointmentsByUser = getAppointmentsByUser;
const repo = __importStar(require("../dataAccess/appointmentRepository"));
const mongoose_1 = require("mongoose");
// List appointments with optional filters
async function getAppointments(companyId, clinicId, filters = {}) {
    // filters.employeeId is now always a string UID => pass through
    return repo.listAppointments(companyId, clinicId, filters);
}
// Get single appointment by ID
async function getAppointmentById(companyId, clinicId, appointmentId) {
    return repo.findAppointmentById(companyId, clinicId, appointmentId);
}
// Create a new appointment
async function createAppointment(companyId, clinicId, data, createdByUid) {
    const doc = {
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
        // everything in data, including data.employeeId which is a UID string
        ...data,
        createdBy: createdByUid,
    };
    return repo.createAppointment(doc);
}
// Update appointment
async function updateAppointment(companyId, clinicId, appointmentId, updates) {
    return repo.updateAppointmentById(appointmentId, updates);
}
// Delete appointment
async function deleteAppointment(companyId, clinicId, appointmentId) {
    return repo.deleteAppointmentById(appointmentId);
}
/**
 * Fetch all appointments tagged with createdBy = userId
 */
async function getAppointmentsByUser(userId) {
    return repo.listAppointmentsByUser(userId);
}
