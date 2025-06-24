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
exports.deleteEmployee = exports.updateEmployee = exports.addEmployee = exports.removeEmployee = exports.upsertEmployee = exports.listEmployees = void 0;
const empService = __importStar(require("../services/employeeService"));
// List employees in a clinic/company
const listEmployees = async (req, res, next) => {
    try {
        const emps = await empService.listEmployees(req.params.companyId, req.params.clinicId);
        res.json(emps);
    }
    catch (err) {
        next(err);
    }
};
exports.listEmployees = listEmployees;
// Add (or update) employee
const upsertEmployee = async (req, res, next) => {
    try {
        const { userUid, ...data } = req.body;
        const emp = await empService.upsertEmployee(req.params.companyId, req.params.clinicId, userUid, data);
        res.status(201).json(emp);
    }
    catch (err) {
        next(err);
    }
};
exports.upsertEmployee = upsertEmployee;
// Remove employee (by userUid)
const removeEmployee = async (req, res, next) => {
    try {
        await empService.removeEmployee(req.params.companyId, req.params.clinicId, req.params.userUid);
        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
};
exports.removeEmployee = removeEmployee;
// Basic CRUD (by employeeId, for admin panel etc)
const addEmployee = async (req, res, next) => {
    try {
        const { companyId } = req.params;
        const data = req.body;
        const employee = await empService.addEmployee(companyId, data);
        res.status(201).json(employee);
    }
    catch (err) {
        next(err);
    }
};
exports.addEmployee = addEmployee;
const updateEmployee = async (req, res, next) => {
    try {
        const { employeeId } = req.params;
        const data = req.body;
        const employee = await empService.updateEmployee(employeeId, data);
        res.json(employee);
    }
    catch (err) {
        next(err);
    }
};
exports.updateEmployee = updateEmployee;
const deleteEmployee = async (req, res, next) => {
    try {
        const { employeeId } = req.params;
        await empService.deleteEmployee(employeeId);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteEmployee = deleteEmployee;
