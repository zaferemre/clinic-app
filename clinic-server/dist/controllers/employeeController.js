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
exports.deleteEmployee = exports.updateEmployee = exports.createEmployee = exports.removeEmployee = exports.upsertEmployee = exports.listEmployees = void 0;
const empService = __importStar(require("../services/employeeService"));
// Listele (enriched)
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
// Upsert (userUid)
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
// Remove (userUid)
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
// createEmployee (admin panel)
const createEmployee = async (req, res, next) => {
    try {
        const emp = await empService.createEmployee(req.body);
        res.status(201).json(emp);
    }
    catch (err) {
        next(err);
    }
};
exports.createEmployee = createEmployee;
// updateEmployee (employeeId)
const updateEmployee = async (req, res, next) => {
    try {
        const { employeeId } = req.params;
        const emp = await empService.updateEmployee(employeeId, req.body);
        res.json(emp);
    }
    catch (err) {
        next(err);
    }
};
exports.updateEmployee = updateEmployee;
// deleteEmployee (employeeId)
const deleteEmployee = async (req, res, next) => {
    try {
        await empService.deleteEmployee(req.params.employeeId);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteEmployee = deleteEmployee;
