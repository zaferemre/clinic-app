"use strict";
// src/controllers/employeeController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEmployee = exports.updateEmployee = exports.addEmployee = exports.listEmployees = void 0;
const Company_1 = __importDefault(require("../models/Company"));
/**
 * List all employees (includes owner as first entry)
 */
const listEmployees = async (req, res, next) => {
    try {
        const { companyId } = req.params;
        const company = await Company_1.default.findById(companyId).exec();
        if (!company) {
            res.status(404).json({ error: "Company not found" });
            return;
        }
        const owner = {
            _id: "owner",
            email: company.ownerEmail,
            name: company.ownerName,
            role: "owner",
            pictureUrl: company.ownerImageUrl,
        };
        res.json([owner, ...company.employees]);
    }
    catch (err) {
        next(err);
    }
};
exports.listEmployees = listEmployees;
/**
 * Add a new employee to a company
 */
const addEmployee = async (req, res, next) => {
    try {
        const { companyId } = req.params;
        const company = await Company_1.default.findById(companyId).exec();
        if (!company) {
            res.status(404).json({ error: "Company not found" });
            return;
        }
        const { name, email, role, pictureUrl, workingHours, services } = req.body;
        company.employees.push({
            name,
            email,
            role,
            pictureUrl,
            workingHours,
            services,
        });
        await company.save();
        const newEmp = company.employees[company.employees.length - 1];
        res.status(201).json(newEmp);
    }
    catch (err) {
        next(err);
    }
};
exports.addEmployee = addEmployee;
/**
 * Update an existing employee by subdocument _id
 */
const updateEmployee = async (req, res, next) => {
    try {
        const { companyId, employeeId } = req.params;
        const company = await Company_1.default.findById(companyId).exec();
        if (!company) {
            res.status(404).json({ error: "Company not found" });
            return;
        }
        const employee = company.employees.id(employeeId);
        if (!employee) {
            res.status(404).json({ error: "Employee not found" });
            return;
        }
        Object.assign(employee, req.body);
        await company.save();
        res.json(employee);
    }
    catch (err) {
        next(err);
    }
};
exports.updateEmployee = updateEmployee;
/**
 * Delete an employee by subdocument _id
 */
const deleteEmployee = async (req, res, next) => {
    try {
        const { companyId, employeeId } = req.params;
        const company = await Company_1.default.findById(companyId).exec();
        if (!company) {
            res.status(404).json({ error: "Company not found" });
            return;
        }
        company.employees = company.employees.filter((emp) => emp._id.toString() !== employeeId);
        await company.save();
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteEmployee = deleteEmployee;
