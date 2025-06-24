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
const Group_1 = __importDefault(require("../models/Group"));
const mongoose_1 = require("mongoose");
async function listGroups(companyId, clinicId) {
    return Group_1.default.find({
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
    }).exec();
}
async function createGroup(doc) {
    return Group_1.default.create(doc);
}
async function findGroupById(companyId, clinicId, groupId) {
    return Group_1.default.findOne({
        _id: new mongoose_1.Types.ObjectId(groupId),
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
    }).exec();
}
async function updateGroupById(groupId, updates) {
    return Group_1.default.findByIdAndUpdate(new mongoose_1.Types.ObjectId(groupId), updates, {
        new: true,
    }).exec();
}
async function deleteGroupById(groupId) {
    return Group_1.default.findByIdAndDelete(new mongoose_1.Types.ObjectId(groupId)).exec();
}
async function addPatientToGroup(companyId, clinicId, groupId, patientId) {
    return Group_1.default.findOneAndUpdate({
        _id: new mongoose_1.Types.ObjectId(groupId),
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
    }, { $addToSet: { patients: new mongoose_1.Types.ObjectId(patientId) } }, { new: true }).exec();
}
async function removePatientFromGroup(companyId, clinicId, groupId, patientId) {
    return Group_1.default.findOneAndUpdate({
        _id: new mongoose_1.Types.ObjectId(groupId),
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
    }, { $pull: { patients: new mongoose_1.Types.ObjectId(patientId) } }, { new: true }).exec();
}
