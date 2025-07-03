"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertEmployee = upsertEmployee;
exports.listEmployees = listEmployees;
exports.removeEmployee = removeEmployee;
exports.createEmployee = createEmployee;
exports.updateEmployee = updateEmployee;
exports.deleteEmployee = deleteEmployee;
const Employee_1 = __importDefault(require("../models/Employee"));
const mongoose_1 = require("mongoose");
async function upsertEmployee(companyId, clinicId, userUid, data) {
    const cId = companyId instanceof mongoose_1.Types.ObjectId
        ? companyId
        : new mongoose_1.Types.ObjectId(companyId);
    const clId = clinicId instanceof mongoose_1.Types.ObjectId
        ? clinicId
        : new mongoose_1.Types.ObjectId(clinicId);
    return Employee_1.default.findOneAndUpdate({ companyId: cId, clinicId: clId, userUid }, { $set: { ...data, companyId: cId, clinicId: clId, userUid } }, { new: true, upsert: true }).exec();
}
async function listEmployees(companyId, clinicId) {
    const cId = companyId instanceof mongoose_1.Types.ObjectId
        ? companyId
        : new mongoose_1.Types.ObjectId(companyId);
    const filter = { companyId: cId };
    if (clinicId)
        filter.clinicId =
            clinicId instanceof mongoose_1.Types.ObjectId
                ? clinicId
                : new mongoose_1.Types.ObjectId(clinicId);
    return Employee_1.default.find(filter).lean();
}
async function removeEmployee(companyId, clinicId, userUid) {
    const cId = companyId instanceof mongoose_1.Types.ObjectId
        ? companyId
        : new mongoose_1.Types.ObjectId(companyId);
    const clId = clinicId instanceof mongoose_1.Types.ObjectId
        ? clinicId
        : new mongoose_1.Types.ObjectId(clinicId);
    return Employee_1.default.deleteOne({ companyId: cId, clinicId: clId, userUid }).exec();
}
async function createEmployee(data) {
    return Employee_1.default.create(data);
}
async function updateEmployee(employeeId, data) {
    const eId = employeeId instanceof mongoose_1.Types.ObjectId
        ? employeeId
        : new mongoose_1.Types.ObjectId(employeeId);
    return Employee_1.default.findByIdAndUpdate(eId, data, { new: true }).exec();
}
async function deleteEmployee(employeeId) {
    const eId = employeeId instanceof mongoose_1.Types.ObjectId
        ? employeeId
        : new mongoose_1.Types.ObjectId(employeeId);
    return Employee_1.default.findByIdAndDelete(eId).exec();
}
