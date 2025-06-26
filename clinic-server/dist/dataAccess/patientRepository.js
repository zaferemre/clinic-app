"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findById = void 0;
exports.listPatients = listPatients;
exports.createPatient = createPatient;
exports.findPatientById = findPatientById;
exports.updatePatientById = updatePatientById;
exports.deletePatientById = deletePatientById;
exports.addPaymentHistory = addPaymentHistory;
exports.addGroupToPatients = addGroupToPatients;
exports.removeGroupFromPatients = removeGroupFromPatients;
exports.removeGroupFromAllPatients = removeGroupFromAllPatients;
exports.getPatientAppointments = getPatientAppointments;
exports.flagPatientCall = flagPatientCall;
const Appointment_1 = __importDefault(require("../models/Appointment"));
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
        _id: new mongoose_1.Types.ObjectId(patientId),
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
    });
}
async function updatePatientById(patientId, updates) {
    return Patient_1.default.findByIdAndUpdate(patientId, updates, { new: true }).exec();
}
async function deletePatientById(patientId) {
    await Patient_1.default.findByIdAndDelete(patientId);
}
// Payment/history helpers:
async function addPaymentHistory(companyId, clinicId, patientId, entry) {
    return Patient_1.default.findOneAndUpdate({
        _id: patientId,
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
    }, { $push: { paymentHistory: entry } }, { new: true });
}
// Group helpers:
async function addGroupToPatients(patientIds, groupId) {
    return Patient_1.default.updateMany({ _id: { $in: patientIds } }, { $addToSet: { groups: groupId } });
}
async function removeGroupFromPatients(patientIds, groupId) {
    return Patient_1.default.updateMany({ _id: { $in: patientIds } }, { $pull: { groups: groupId } });
}
async function removeGroupFromAllPatients(groupId) {
    return Patient_1.default.updateMany({ groups: groupId }, { $pull: { groups: groupId } });
}
exports.findById = findPatientById;
// Fetch all appointments for a patient in company/clinic
async function getPatientAppointments(companyId, clinicId, patientId) {
    return Appointment_1.default.find({
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
        patientId: new mongoose_1.Types.ObjectId(patientId),
    })
        .sort({ start: -1 })
        .exec();
}
// Flag that a patient was called (can be a call history array or just a status)
async function flagPatientCall(companyId, clinicId, patientId, flagType) {
    // Example: add entry to callFlags array
    return Patient_1.default.findOneAndUpdate({
        _id: new mongoose_1.Types.ObjectId(patientId),
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
    }, { $push: { callFlags: { flagType, timestamp: new Date() } } }, { new: true }).exec();
}
