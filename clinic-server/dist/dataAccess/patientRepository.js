"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPatients = listPatients;
exports.createPatient = createPatient;
exports.findPatientById = findPatientById;
exports.updatePatientById = updatePatientById;
exports.deletePatientById = deletePatientById;
exports.addPaymentHistory = addPaymentHistory;
exports.addGroupToPatients = addGroupToPatients;
exports.removeGroupFromPatients = removeGroupFromPatients;
exports.removeGroupFromAllPatients = removeGroupFromAllPatients;
// dataAccess/patientRepository.ts
const Patient_1 = __importDefault(require("../models/Patient"));
const mongoose_1 = require("mongoose");
async function listPatients(companyId, clinicId) {
    return Patient_1.default.find({
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
    });
}
async function createPatient(doc) {
    return Patient_1.default.create(doc);
}
async function findPatientById(companyId, clinicId, patientId) {
    return Patient_1.default.findOne({
        _id: patientId,
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
    });
}
async function updatePatientById(patientId, updates) {
    return Patient_1.default.findByIdAndUpdate(patientId, updates, { new: true });
}
async function deletePatientById(patientId) {
    await Patient_1.default.findByIdAndDelete(patientId);
}
async function addPaymentHistory(companyId, clinicId, patientId, entry) {
    return Patient_1.default.findOneAndUpdate({
        _id: patientId,
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
    }, { $push: { paymentHistory: entry } }, { new: true });
}
// Add groupId to multiple patients' groups array
async function addGroupToPatients(patientIds, groupId) {
    return Patient_1.default.updateMany({ _id: { $in: patientIds } }, { $addToSet: { groups: groupId } });
}
// Remove groupId from multiple patients' groups array
async function removeGroupFromPatients(patientIds, groupId) {
    return Patient_1.default.updateMany({ _id: { $in: patientIds } }, { $pull: { groups: groupId } });
}
// Remove groupId from all patients (on group deletion)
async function removeGroupFromAllPatients(groupId) {
    return Patient_1.default.updateMany({ groups: groupId }, { $pull: { groups: groupId } });
}
