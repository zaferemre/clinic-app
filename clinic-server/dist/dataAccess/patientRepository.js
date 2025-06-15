"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findByCompany = findByCompany;
exports.findById = findById;
exports.create = create;
exports.updateById = updateById;
exports.deleteById = deleteById;
exports.recordPayment = recordPayment;
const Patient_1 = __importDefault(require("../models/Patient"));
function findByCompany(companyId) {
    return Patient_1.default.find({ companyId }).exec();
}
// ← updated: now enforces companyId
function findById(companyId, patientId) {
    return Patient_1.default.findOne({ _id: patientId, companyId }).exec();
}
function create(data) {
    return new Patient_1.default(data).save();
}
function updateById(companyId, patientId, updates) {
    return Patient_1.default.findOneAndUpdate({ _id: patientId, companyId }, updates, {
        new: true,
    }).exec();
}
function deleteById(companyId, patientId) {
    return Patient_1.default.deleteOne({ _id: patientId, companyId }).exec();
}
function recordPayment(companyId, patientId, payment) {
    return Patient_1.default.findOneAndUpdate({ _id: patientId, companyId }, { $push: { paymentHistory: { ...payment, date: new Date() } } }, { new: true }).exec();
}
