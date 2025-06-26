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
exports.listGroups = listGroups;
exports.createGroup = createGroup;
exports.getGroup = getGroup;
exports.updateGroup = updateGroup;
exports.deleteGroup = deleteGroup;
exports.addPatientToGroup = addPatientToGroup;
exports.removePatientFromGroup = removePatientFromGroup;
const groupRepo = __importStar(require("../dataAccess/groupRepository"));
const patientRepo = __importStar(require("../dataAccess/patientRepository"));
const mongoose_1 = require("mongoose");
const http_errors_1 = __importDefault(require("http-errors"));
const cacheHelpers_1 = require("../utils/cacheHelpers");
function validId(id) {
    return mongoose_1.Types.ObjectId.isValid(id);
}
async function listGroups(companyId, clinicId) {
    if (!validId(companyId) || !validId(clinicId))
        throw (0, http_errors_1.default)(400, "Invalid company or clinic id");
    const cacheKey = `groups:${companyId}:${clinicId}`;
    return (0, cacheHelpers_1.getOrSetCache)(cacheKey, () => groupRepo.listGroups(companyId, clinicId));
}
async function createGroup(companyId, clinicId, data, uid) {
    if (!validId(companyId) || !validId(clinicId))
        throw (0, http_errors_1.default)(400, "Invalid company or clinic id");
    const doc = {
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
        name: data.name,
        note: data.note,
        credit: typeof data.credit === "number" ? data.credit : 0,
        maxSize: data.maxSize ?? 0,
        status: data.status ?? "active",
        patients: (Array.isArray(data.patients) ? data.patients : []).map((id) => new mongoose_1.Types.ObjectId(id)),
        employees: (Array.isArray(data.employees) ? data.employees : []).map((id) => new mongoose_1.Types.ObjectId(id)),
        groupType: data.groupType,
        appointments: [],
        createdBy: uid,
        customFields: data.customFields ?? {},
    };
    const group = await groupRepo.createGroup(doc);
    if (doc.patients.length) {
        await patientRepo.addGroupToPatients(doc.patients.map((o) => o.toString()), group.id.toString());
    }
    await (0, cacheHelpers_1.invalidateCache)(`groups:${companyId}:${clinicId}`);
    return group;
}
async function getGroup(companyId, clinicId, groupId) {
    if (!validId(companyId) || !validId(clinicId) || !validId(groupId))
        throw (0, http_errors_1.default)(400, "Invalid id(s)");
    const group = await groupRepo.findGroupById(companyId, clinicId, groupId);
    if (!group)
        throw (0, http_errors_1.default)(404, "Group not found");
    return group;
}
async function updateGroup(companyId, clinicId, groupId, updates) {
    const updated = await groupRepo.updateGroupById(groupId, updates);
    await (0, cacheHelpers_1.invalidateCache)(`groups:${companyId}:${clinicId}`);
    return updated;
}
async function deleteGroup(companyId, clinicId, groupId) {
    await groupRepo.deleteGroupById(groupId);
    await (0, cacheHelpers_1.invalidateCache)(`groups:${companyId}:${clinicId}`);
}
async function addPatientToGroup(companyId, clinicId, groupId, patientId) {
    if (!validId(groupId) || !validId(patientId))
        throw (0, http_errors_1.default)(400, "Invalid groupId or patientId");
    const updatedGroup = await groupRepo.addPatientToGroup(companyId, clinicId, groupId, patientId);
    await patientRepo.addGroupToPatients([patientId], groupId);
    return updatedGroup;
}
async function removePatientFromGroup(companyId, clinicId, groupId, patientId) {
    if (!validId(groupId) || !validId(patientId))
        throw (0, http_errors_1.default)(400, "Invalid groupId or patientId");
    const updatedGroup = await groupRepo.removePatientFromGroup(companyId, clinicId, groupId, patientId);
    await patientRepo.removeGroupFromPatients([patientId], groupId);
    return updatedGroup;
}
