"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveCompany = exports.deleteUserAccount = exports.getServices = exports.updateServices = exports.updateWorkingHours = exports.getEmployeeSchedule = exports.joinCompany = exports.deleteEmployee = exports.updateEmployee = exports.addEmployee = exports.listEmployees = exports.deleteCompany = exports.updateCompany = exports.getCompany = exports.createCompany = void 0;
const companyService = __importStar(require("../services/companyService"));
// POST   /company
const createCompany = async (req, res, next) => {
    try {
        const company = await companyService.createCompany(req.user, req.body);
        res.status(201).json(company);
    }
    catch (err) {
        next(err);
    }
};
exports.createCompany = createCompany;
// GET    /company or /company/:companyId
const getCompany = async (req, res, next) => {
    try {
        const dto = await companyService.getCompany(req.params.companyId, req.user);
        res.status(200).json(dto);
    }
    catch (err) {
        next(err);
    }
};
exports.getCompany = getCompany;
// PATCH  /company/:companyId
const updateCompany = async (req, res, next) => {
    try {
        const updated = await companyService.updateCompany(req.params.companyId, req.body, req.user);
        res.status(200).json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.updateCompany = updateCompany;
// DELETE /company/:companyId
const deleteCompany = async (req, res, next) => {
    try {
        await companyService.deleteCompany(req.params.companyId, req.user);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteCompany = deleteCompany;
// GET    /company/:companyId/employees
const listEmployees = async (req, res, next) => {
    try {
        const list = await companyService.listEmployees(req.params.companyId);
        res.json(list);
    }
    catch (err) {
        next(err);
    }
};
exports.listEmployees = listEmployees;
// POST   /company/:companyId/employees
const addEmployee = async (req, res, next) => {
    try {
        const e = await companyService.addEmployee(req.params.companyId, req.body);
        res.status(201).json(e);
    }
    catch (err) {
        next(err);
    }
};
exports.addEmployee = addEmployee;
// PATCH  /company/:companyId/employees/:employeeId
const updateEmployee = async (req, res, next) => {
    try {
        const e = await companyService.updateEmployee(req.params.companyId, req.params.employeeId, req.body);
        res.json(e);
    }
    catch (err) {
        next(err);
    }
};
exports.updateEmployee = updateEmployee;
// DELETE /company/:companyId/employees/:employeeId
const deleteEmployee = async (req, res, next) => {
    try {
        await companyService.deleteEmployee(req.params.companyId, req.params.employeeId);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteEmployee = deleteEmployee;
// POST   /company/:companyId/join
const joinCompany = async (req, res, next) => {
    try {
        const info = await companyService.joinCompany(req.params.companyId, req.body.joinCode, req.user);
        res.json(info);
    }
    catch (err) {
        next(err);
    }
};
exports.joinCompany = joinCompany;
// GET    /company/:companyId/schedule/:employeeId
const getEmployeeSchedule = async (req, res, next) => {
    try {
        const sched = await companyService.getEmployeeSchedule(req.params.companyId, req.params.employeeId, req.user.email);
        res.json(sched);
    }
    catch (err) {
        next(err);
    }
};
exports.getEmployeeSchedule = getEmployeeSchedule;
// PATCH  /company/:companyId/working-hours
const updateWorkingHours = async (req, res, next) => {
    try {
        const wh = await companyService.updateWorkingHours(req.params.companyId, req.body.workingHours, req.user);
        res.json(wh);
    }
    catch (err) {
        next(err);
    }
};
exports.updateWorkingHours = updateWorkingHours;
// PATCH  /company/:companyId/services
const updateServices = async (req, res, next) => {
    try {
        const svcs = await companyService.updateServices(req.params.companyId, req.body.services, req.user);
        res.json(svcs);
    }
    catch (err) {
        next(err);
    }
};
exports.updateServices = updateServices;
// GET    /company/:companyId/services
const getServices = async (req, res, next) => {
    try {
        const svcs = await companyService.getServices(req.params.companyId);
        res.json(svcs);
    }
    catch (err) {
        next(err);
    }
};
exports.getServices = getServices;
// DELETE /company/user
const deleteUserAccount = async (req, res, next) => {
    try {
        await companyService.deleteUserAccount(req.user.email, req.user.uid);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteUserAccount = deleteUserAccount;
const leaveCompany = async (req, res, next) => {
    try {
        const userEmail = req.user?.email;
        const { companyId } = req.params;
        const result = await companyService.leaveCompany(companyId, userEmail);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
};
exports.leaveCompany = leaveCompany;
