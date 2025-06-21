"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listEmployees = listEmployees;
exports.createEmployee = createEmployee;
exports.findEmployeeById = findEmployeeById;
exports.updateEmployeeById = updateEmployeeById;
exports.deleteEmployeeById = deleteEmployeeById;
exports.deleteEmployeesByEmail = deleteEmployeesByEmail;
// dataAccess/employeeRepository.ts
const Employee_1 = __importDefault(require("../models/Employee"));
const mongoose_1 = require("mongoose");
async function listEmployees(companyId, clinicId) {
    const filter = { companyId: new mongoose_1.Types.ObjectId(companyId) };
    if (clinicId)
        filter.clinicId = new mongoose_1.Types.ObjectId(clinicId);
    return Employee_1.default.find(filter).populate(["role", "services"]);
}
async function createEmployee(doc) {
    return Employee_1.default.create(doc);
}
async function findEmployeeById(companyId, clinicId, employeeId) {
    return Employee_1.default.findOne({
        _id: employeeId,
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
    });
}
function updateEmployeeById(employeeId, updates) {
    return Employee_1.default.findByIdAndUpdate(employeeId, updates, { new: true }).exec();
}
function deleteEmployeeById(employeeId) {
    return Employee_1.default.findByIdAndDelete(employeeId).exec();
}
/**
 * Remove _all_ employee docs for this email in this company
 */
function deleteEmployeesByEmail(companyId, email) {
    return Employee_1.default.deleteMany({
        companyId: new mongoose_1.Types.ObjectId(companyId),
        email,
    }).exec();
}
