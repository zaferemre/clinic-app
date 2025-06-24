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
exports.getGroupById = exports.createGroupAppointment = exports.listGroupAppointments = exports.removePatientFromGroup = exports.addPatientToGroup = exports.deleteGroup = exports.updateGroup = exports.getGroup = exports.createGroup = exports.listGroups = void 0;
const groupService = __importStar(require("../services/groupService"));
const appointmentService = __importStar(require("../services/appointmentService")); // assumed
// List all groups in a clinic
const listGroups = async (req, res, next) => {
    try {
        const groups = await groupService.listGroups(req.params.companyId, req.params.clinicId);
        res.json(groups);
    }
    catch (err) {
        next(err);
    }
};
exports.listGroups = listGroups;
// Create a new group
const createGroup = async (req, res, next) => {
    try {
        const uid = req.user?.uid;
        const group = await groupService.createGroup(req.params.companyId, req.params.clinicId, req.body, uid);
        res.status(201).json(group);
    }
    catch (err) {
        next(err);
    }
};
exports.createGroup = createGroup;
// Get group by ID
const getGroup = async (req, res, next) => {
    try {
        const group = await groupService.getGroup(req.params.companyId, req.params.clinicId, req.params.groupId);
        res.json(group);
    }
    catch (err) {
        next(err);
    }
};
exports.getGroup = getGroup;
exports.getGroupById = exports.getGroup;
// Update group
const updateGroup = async (req, res, next) => {
    try {
        const updated = await groupService.updateGroup(req.params.companyId, req.params.clinicId, req.params.groupId, req.body);
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.updateGroup = updateGroup;
// Delete group
const deleteGroup = async (req, res, next) => {
    try {
        await groupService.deleteGroup(req.params.companyId, req.params.clinicId, req.params.groupId);
        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
};
exports.deleteGroup = deleteGroup;
// Add patient to group
const addPatientToGroup = async (req, res, next) => {
    try {
        const updated = await groupService.addPatientToGroup(req.params.companyId, req.params.clinicId, req.params.groupId, req.body.patientId);
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.addPatientToGroup = addPatientToGroup;
// Remove patient from group
const removePatientFromGroup = async (req, res, next) => {
    try {
        const updated = await groupService.removePatientFromGroup(req.params.companyId, req.params.clinicId, req.params.groupId, req.params.patientId);
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.removePatientFromGroup = removePatientFromGroup;
// --- NEW: List appointments for a group
const listGroupAppointments = async (req, res, next) => {
    try {
        const { companyId, clinicId, groupId } = req.params;
        // If your appointmentService uses a groupId filter, use it directly:
        const appointments = await appointmentService.getAppointments(companyId, clinicId, { groupId });
        res.json(appointments);
    }
    catch (err) {
        next(err);
    }
};
exports.listGroupAppointments = listGroupAppointments;
// --- NEW: Create an appointment for a group
const createGroupAppointment = async (req, res, next) => {
    try {
        const { companyId, clinicId, groupId } = req.params;
        const uid = req.user?.uid;
        const data = {
            ...req.body,
            groupId, // tie to this group
        };
        const created = await appointmentService.createAppointment(companyId, clinicId, data, uid);
        res.status(201).json(created);
    }
    catch (err) {
        next(err);
    }
};
exports.createGroupAppointment = createGroupAppointment;
