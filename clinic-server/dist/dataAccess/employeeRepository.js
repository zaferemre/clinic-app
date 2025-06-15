"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findByCompany = findByCompany;
exports.addEmployee = addEmployee;
exports.updateEmployee = updateEmployee;
exports.deleteEmployee = deleteEmployee;
const Company_1 = __importDefault(require("../models/Company"));
function findByCompany(companyId) {
    return Company_1.default.findById(companyId).then((c) => {
        if (!c) {
            const error = new Error("Company not found");
            error.status = 404;
            throw error;
        }
        const owner = {
            _id: "owner",
            email: c.ownerEmail,
            name: c.ownerName,
            role: "owner",
            pictureUrl: c.ownerImageUrl,
        };
        return [owner, ...c.employees];
    });
}
function addEmployee(companyId, dto) {
    return Company_1.default.findById(companyId).then((c) => {
        if (!c) {
            const error = new Error("Company not found");
            error.status = 404;
            throw error;
        }
        c.employees.push(dto);
        return c.save().then(() => c.employees.at(-1));
    });
}
function updateEmployee(companyId, employeeId, updates) {
    return Company_1.default.findById(companyId).then((c) => {
        if (!c) {
            const error = new Error("Company not found");
            error.status = 404;
            throw error;
        }
        const emp = c.employees.id(employeeId);
        if (!emp) {
            const error = new Error("Employee not found");
            error.status = 404;
            throw error;
        }
        Object.assign(emp, updates);
        return c.save().then(() => emp);
    });
}
function deleteEmployee(companyId, employeeId) {
    return Company_1.default.findById(companyId).then((c) => {
        if (!c) {
            const error = new Error("Company not found");
            error.status = 404;
            throw error;
        }
        c.employees = c.employees.filter((emp) => emp._id.toString() !== employeeId);
        return c.save();
    });
}
