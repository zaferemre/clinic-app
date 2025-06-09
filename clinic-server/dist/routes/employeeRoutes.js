"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/EmployeeRoutes.ts
const express_1 = __importDefault(require("express"));
const Company_1 = __importDefault(require("../models/Company"));
const verifyFirebaseToken_1 = require("../middlewares/verifyFirebaseToken");
const authorizeCompanyAccess_1 = require("../middlewares/authorizeCompanyAccess");
const router = express_1.default.Router();
// Helper to wrap async route handlers and pass errors to next()
function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
router.get("/:companyId/employees", verifyFirebaseToken_1.verifyFirebaseToken, authorizeCompanyAccess_1.authorizeCompanyAccess, asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    const company = await Company_1.default.findById(companyId).exec();
    if (!company)
        return res.status(404).json({ error: "Company not found" });
    // Include owner as employee with role 'owner'
    const ownerAsEmployee = {
        _id: "owner",
        email: company.ownerEmail,
        name: company.ownerEmail,
        role: "owner",
        pictureUrl: "", // Optionally add image
    };
    // Send owner as first element + all other employees
    const employees = [ownerAsEmployee, ...(company.employees ?? [])];
    res.json(employees);
}));
router.post("/:companyId/employees", verifyFirebaseToken_1.verifyFirebaseToken, authorizeCompanyAccess_1.authorizeCompanyAccess, asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    const { name, email, role, pictureUrl, workingHours, services } = req.body;
    const company = await Company_1.default.findById(companyId).exec();
    if (!company)
        return res.status(404).json({ error: "Company not found" });
    const newEmployee = {
        name,
        email,
        role,
        pictureUrl,
        workingHours,
        services,
    };
    company.employees.push(newEmployee);
    await company.save();
    res.status(201).json(company.employees.at(-1));
}));
router.patch("/:companyId/employees/:employeeId", verifyFirebaseToken_1.verifyFirebaseToken, authorizeCompanyAccess_1.authorizeCompanyAccess, asyncHandler(async (req, res) => {
    const { companyId, employeeId } = req.params;
    const company = await Company_1.default.findById(companyId).exec();
    if (!company)
        return res.status(404).json({ error: "Company not found" });
    // Find the employee subdoc by _id (as string)
    const employee = company.employees.id(employeeId);
    if (!employee)
        return res.status(404).json({ error: "Employee not found" });
    // Apply updates (shallow)
    Object.assign(employee, req.body);
    await company.save();
    res.json(employee);
}));
router.delete("/:companyId/employees/:employeeId", verifyFirebaseToken_1.verifyFirebaseToken, authorizeCompanyAccess_1.authorizeCompanyAccess, asyncHandler(async (req, res) => {
    const { companyId, employeeId } = req.params;
    const company = await Company_1.default.findById(companyId).exec();
    if (!company)
        return res.status(404).json({ error: "Company not found" });
    // Remove employee by _id
    company.employees = company.employees.filter((emp) => emp._id.toString() !== employeeId);
    await company.save();
    res.json({ success: true });
}));
exports.default = router;
