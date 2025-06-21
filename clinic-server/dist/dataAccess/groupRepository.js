"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listGroups = listGroups;
exports.createGroup = createGroup;
exports.findGroupById = findGroupById;
exports.updateGroupById = updateGroupById;
exports.deleteGroupById = deleteGroupById;
exports.addPatientToGroup = addPatientToGroup;
exports.removePatientFromGroup = removePatientFromGroup;
// dataAccess/groupRepository.ts
const Group_1 = __importDefault(require("../models/Group"));
const mongoose_1 = require("mongoose");
async function listGroups(companyId, clinicId) {
    return Group_1.default.find({
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
    });
}
async function createGroup(doc) {
    return Group_1.default.create(doc);
}
async function findGroupById(companyId, clinicId, groupId) {
    return Group_1.default.findOne({
        _id: groupId,
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
    });
}
async function updateGroupById(groupId, updates) {
    return Group_1.default.findByIdAndUpdate(groupId, updates, { new: true });
}
async function deleteGroupById(groupId) {
    await Group_1.default.findByIdAndDelete(groupId);
}
async function addPatientToGroup(companyId, clinicId, groupId, patientId) {
    return Group_1.default.findOneAndUpdate({
        _id: groupId,
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
    }, { $addToSet: { patients: new mongoose_1.Types.ObjectId(patientId) } }, { new: true });
}
async function removePatientFromGroup(companyId, clinicId, groupId, patientId) {
    return Group_1.default.findOneAndUpdate({
        _id: groupId,
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
    }, { $pull: { patients: new mongoose_1.Types.ObjectId(patientId) } }, { new: true });
}
