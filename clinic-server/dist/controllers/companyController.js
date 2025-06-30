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
exports.listEmployees = exports.leaveCompany = exports.joinByCode = exports.deleteCompany = exports.updateCompany = exports.getCompany = exports.createCompany = exports.listCompanies = void 0;
const companyService = __importStar(require("../services/companyService"));
const mongoose_1 = require("mongoose");
// List all companies user belongs to
const listCompanies = async (req, res, next) => {
    try {
        const uid = req.user?.uid;
        // Now returns array of user's memberships, not company objects
        const companies = await companyService.getCompaniesForUser(uid);
        res.json(companies);
    }
    catch (err) {
        next(err);
    }
};
exports.listCompanies = listCompanies;
// Create new company
const createCompany = async (req, res, next) => {
    try {
        const uid = req.user?.uid;
        const company = await companyService.createCompany(uid, req.body);
        res.status(201).json(company);
    }
    catch (err) {
        next(err);
    }
};
exports.createCompany = createCompany;
// Get company by ID
const getCompany = async (req, res, next) => {
    try {
        const companyId = new mongoose_1.Types.ObjectId(req.params.companyId);
        const company = await companyService.getCompanyById(companyId);
        if (!company) {
            res.status(404).json({ error: "Company not found" });
            return;
        }
        res.json(company);
    }
    catch (err) {
        next(err);
    }
};
exports.getCompany = getCompany;
// Update company (owner only)
const updateCompany = async (req, res, next) => {
    try {
        const uid = req.user?.uid;
        const companyId = new mongoose_1.Types.ObjectId(req.params.companyId);
        const updated = await companyService.updateCompany(companyId, req.body, uid);
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.updateCompany = updateCompany;
// Delete company (owner only)
const deleteCompany = async (req, res, next) => {
    try {
        const uid = req.user?.uid;
        const companyId = new mongoose_1.Types.ObjectId(req.params.companyId);
        await companyService.deleteCompany(companyId, uid);
        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
};
exports.deleteCompany = deleteCompany;
// Join company by code
const joinByCode = async (req, res, next) => {
    try {
        const { joinCode } = req.body;
        const user = req.user;
        const result = await companyService.joinByCode(user.uid, joinCode);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
};
exports.joinByCode = joinByCode;
// Leave company
const leaveCompany = async (req, res, next) => {
    try {
        const { companyId } = req.params;
        const user = req.user;
        const oid = new mongoose_1.Types.ObjectId(companyId);
        const result = await companyService.leaveCompany(user.uid, oid);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
};
exports.leaveCompany = leaveCompany;
// List company employees
const listEmployees = async (req, res, next) => {
    try {
        const { companyId } = req.params;
        const oid = new mongoose_1.Types.ObjectId(companyId);
        const employees = await companyService.listEmployees(oid);
        res.json(employees);
    }
    catch (err) {
        next(err);
    }
};
exports.listEmployees = listEmployees;
