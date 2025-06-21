"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEmployee = addEmployee;
exports.removeEmployeeByEmail = removeEmployeeByEmail;
exports.deleteEmployeeByEmail = deleteEmployeeByEmail;
exports.listEmployees = listEmployees;
exports.updateEmployee = updateEmployee;
exports.deleteEmployee = deleteEmployee;
const Employee_1 = __importDefault(require("../models/Employee"));
const mongoose_1 = __importDefault(require("mongoose"));
// Add or update an employee
async function addEmployee(companyId, clinicId, data, userId) {
    let emp = await Employee_1.default.findOne({
        companyId: new mongoose_1.default.Types.ObjectId(companyId),
        email: data.email,
    });
    if (!emp) {
        emp = new Employee_1.default({
            companyId: new mongoose_1.default.Types.ObjectId(companyId),
            clinicId: new mongoose_1.default.Types.ObjectId(clinicId),
            userId,
            email: data.email,
            name: data.name,
            role: data.role || "other",
            pictureUrl: data.pictureUrl || "",
            services: [],
            workingHours: [],
            isActive: true,
        });
        await emp.save();
    }
    else {
        emp.clinicId = new mongoose_1.default.Types.ObjectId(clinicId);
        if (data.name)
            emp.name = data.name;
        if (data.role)
            emp.role = data.role;
        if (data.pictureUrl)
            emp.pictureUrl = data.pictureUrl;
        await emp.save();
    }
    return emp;
}
async function removeEmployeeByEmail(companyId, email) {
    await Employee_1.default.deleteOne({
        companyId: new mongoose_1.default.Types.ObjectId(companyId),
        email,
    });
}
async function deleteEmployeeByEmail(email) {
    await Employee_1.default.deleteMany({ email });
}
async function listEmployees(companyId) {
    return Employee_1.default.find({
        companyId: new mongoose_1.default.Types.ObjectId(companyId),
    }).exec();
}
async function updateEmployee(employeeId, updates) {
    return Employee_1.default.findByIdAndUpdate(employeeId, updates, { new: true }).exec();
}
async function deleteEmployee(employeeId) {
    return Employee_1.default.findByIdAndDelete(employeeId).exec();
}
