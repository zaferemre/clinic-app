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
exports.removePatientFromGroup = exports.addPatientToGroup = exports.deleteGroup = exports.updateGroup = exports.getGroupById = exports.createGroup = exports.listGroups = void 0;
const groupService = __importStar(require("../services/groupService"));
const listGroups = async (req, res, next) => {
    try {
        const { companyId, clinicId } = req.params;
        const groups = await groupService.listGroups(companyId, clinicId);
        res.status(200).json(groups);
    }
    catch (err) {
        next(err);
    }
};
exports.listGroups = listGroups;
const createGroup = async (req, res, next) => {
    console.log("req.user:", req.user);
    try {
        const { companyId, clinicId } = req.params;
        const user = req.user;
        const created = await groupService.createGroup(companyId, clinicId, req.body, user.uid);
        res.status(201).json(created);
    }
    catch (err) {
        next(err);
    }
};
exports.createGroup = createGroup;
const getGroupById = async (req, res, next) => {
    try {
        const { companyId, clinicId, groupId } = req.params;
        const group = await groupService.getGroup(companyId, clinicId, groupId);
        res.status(200).json(group);
    }
    catch (err) {
        next(err);
    }
};
exports.getGroupById = getGroupById;
const updateGroup = async (req, res, next) => {
    try {
        const { companyId, clinicId, groupId } = req.params;
        const updated = await groupService.updateGroup(companyId, clinicId, groupId, req.body);
        res.status(200).json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.updateGroup = updateGroup;
const deleteGroup = async (req, res, next) => {
    try {
        const { companyId, clinicId, groupId } = req.params;
        await groupService.deleteGroup(companyId, clinicId, groupId);
        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
};
exports.deleteGroup = deleteGroup;
const addPatientToGroup = async (req, res, next) => {
    try {
        const { companyId, clinicId, groupId } = req.params;
        const { patientId } = req.body;
        const updated = await groupService.addPatientToGroup(companyId, clinicId, groupId, patientId);
        res.status(200).json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.addPatientToGroup = addPatientToGroup;
const removePatientFromGroup = async (req, res, next) => {
    try {
        const { companyId, clinicId, groupId, patientId } = req.params;
        const updated = await groupService.removePatientFromGroup(companyId, clinicId, groupId, patientId);
        res.status(200).json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.removePatientFromGroup = removePatientFromGroup;
