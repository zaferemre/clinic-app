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
exports.deleteEmployee = exports.updateEmployee = exports.addEmployee = exports.listEmployees = void 0;
const employeeService = __importStar(require("../services/employeeService"));
const listEmployees = async (req, res, next) => {
    try {
        const list = await employeeService.listEmployees(req.params.companyId);
        res.status(200).json(list);
    }
    catch (err) {
        next(err);
    }
};
exports.listEmployees = listEmployees;
const addEmployee = async (req, res, next) => {
    try {
        const e = await employeeService.addEmployee(req.params.companyId, req.body);
        res.status(201).json(e);
    }
    catch (err) {
        next(err);
    }
};
exports.addEmployee = addEmployee;
const updateEmployee = async (req, res, next) => {
    try {
        const e = await employeeService.updateEmployee(req.params.companyId, req.params.employeeId, req.body);
        res.status(200).json(e);
    }
    catch (err) {
        next(err);
    }
};
exports.updateEmployee = updateEmployee;
const deleteEmployee = async (req, res, next) => {
    try {
        await employeeService.deleteEmployee(req.params.companyId, req.params.employeeId);
        res.status(200).json({ success: true });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteEmployee = deleteEmployee;
