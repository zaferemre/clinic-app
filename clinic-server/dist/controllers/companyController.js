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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinClinic = exports.joinByCode = exports.deleteUserAccount = exports.leaveCompany = exports.listEmployees = exports.deleteCompany = exports.updateCompany = exports.getCompanyById = exports.listCompanies = exports.createCompany = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const companyService = __importStar(require("../services/companyService"));
const employeeService = __importStar(require("../services/employeeService"));
const Employee_1 = __importDefault(require("../models/Employee"));
const Clinic_1 = __importDefault(require("../models/Clinic"));
const mongoose_1 = __importDefault(require("mongoose"));
// --- CREATE COMPANY (OWNER FLOW) --- //
const createCompany = async (req, res, next) => {
    try {
        const { name, websiteUrl, socialLinks, settings } = req.body;
        const user = req.user;
        if (!user)
            throw (0, http_errors_1.default)(401, "Unauthorized");
        // Only pass user input fields, service will use user for owner info
        const company = await companyService.createCompany(user, {
            name,
            websiteUrl,
            socialLinks,
            settings,
        });
        res.status(201).json(company);
    }
    catch (err) {
        next(err);
    }
};
exports.createCompany = createCompany;
const listCompanies = async (req, res, next) => {
    try {
        const user = req.user;
        const companies = await companyService.listCompanies(user);
        res.status(200).json(companies);
    }
    catch (err) {
        next(err);
    }
};
exports.listCompanies = listCompanies;
const getCompanyById = async (req, res, next) => {
    try {
        const companyId = req.params.companyId;
        const company = await companyService.getCompany(companyId);
        res.status(200).json(company);
    }
    catch (err) {
        next(err);
    }
};
exports.getCompanyById = getCompanyById;
const updateCompany = async (req, res, next) => {
    try {
        const companyId = req.params.companyId;
        const user = req.user;
        const updated = await companyService.updateCompany(companyId, req.body, user);
        res.status(200).json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.updateCompany = updateCompany;
const deleteCompany = async (req, res, next) => {
    try {
        const companyId = req.params.companyId;
        const user = req.user;
        await companyService.deleteCompany(companyId, user);
        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
};
exports.deleteCompany = deleteCompany;
const listEmployees = async (req, res, next) => {
    try {
        const companyId = req.params.companyId;
        const employees = await employeeService.listEmployees(companyId);
        res.status(200).json(employees);
    }
    catch (err) {
        next(err);
    }
};
exports.listEmployees = listEmployees;
const leaveCompany = async (req, res, next) => {
    try {
        const companyId = req.params.companyId;
        const user = req.user;
        await companyService.leaveCompany(companyId, user.email);
        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
};
exports.leaveCompany = leaveCompany;
const deleteUserAccount = async (req, res, next) => {
    try {
        const user = req.user;
        await companyService.deleteUserAccount(user);
        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
};
exports.deleteUserAccount = deleteUserAccount;
const joinByCode = async (req, res, next) => {
    try {
        const { joinCode } = req.body;
        if (!joinCode)
            throw (0, http_errors_1.default)(400, "Join code required");
        const user = req.user;
        const result = await companyService.joinByCode(joinCode, user);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
};
exports.joinByCode = joinByCode;
const joinClinic = async (req, res, next) => {
    try {
        const { companyId, clinicId } = req.params;
        const email = req.user.email;
        const emp = await Employee_1.default.findOne({
            companyId: new mongoose_1.default.Types.ObjectId(companyId),
            email,
        });
        if (!emp)
            throw (0, http_errors_1.default)(404, "Must join company first");
        emp.clinicId = new mongoose_1.default.Types.ObjectId(clinicId);
        await emp.save();
        await Clinic_1.default.findByIdAndUpdate(clinicId, {
            $addToSet: { employees: emp._id },
        });
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
};
exports.joinClinic = joinClinic;
