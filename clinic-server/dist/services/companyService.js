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
exports.createCompany = createCompany;
exports.getCompany = getCompany;
exports.getCompanyByJoinCode = getCompanyByJoinCode;
exports.updateCompany = updateCompany;
exports.deleteCompany = deleteCompany;
exports.joinCompany = joinCompany;
exports.joinByCode = joinByCode;
exports.leaveCompany = leaveCompany;
exports.deleteUserAccount = deleteUserAccount;
exports.listCompanies = listCompanies;
const uuid_1 = require("uuid");
const http_errors_1 = __importDefault(require("http-errors"));
const repo = __importStar(require("../dataAccess/companyRepository"));
const clinicService = __importStar(require("./clinicService"));
const employeeService = __importStar(require("./employeeService"));
const Company_1 = __importDefault(require("../models/Company"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
async function createCompany(user, data) {
    if (!data.name)
        throw (0, http_errors_1.default)(400, "Company name is required");
    const company = await repo.createCompany({
        name: data.name,
        ownerUserId: user.uid,
        ownerName: user.name ?? "",
        ownerEmail: user.email,
        ownerImageUrl: user.picture ?? "",
        subscription: {
            plan: "free",
            status: "trialing",
            provider: "manual",
            maxClinics: 1,
            allowedFeatures: ["basicCalendar"],
        },
        joinCode: (0, uuid_1.v4)(),
        settings: data.settings ?? {},
        websiteUrl: data.websiteUrl ?? "",
        socialLinks: data.socialLinks ?? {},
    });
    return company;
}
async function getCompany(companyId) {
    const company = await repo.findCompanyById(companyId);
    if (!company)
        throw (0, http_errors_1.default)(404, "Company not found");
    return company;
}
async function getCompanyByJoinCode(joinCode) {
    return repo.findCompanyByJoinCode(joinCode);
}
async function updateCompany(companyId, updates, user) {
    const existing = await repo.findCompanyById(companyId);
    if (!existing)
        throw (0, http_errors_1.default)(404, "Company not found");
    if (existing.ownerUserId !== user.uid)
        throw (0, http_errors_1.default)(403, "Only the owner can update this company");
    const updated = await repo.updateCompanyById(companyId, updates);
    if (!updated)
        throw (0, http_errors_1.default)(500, "Failed to update company");
    return updated;
}
async function deleteCompany(companyId, user) {
    const existing = await repo.findCompanyById(companyId);
    if (!existing)
        throw (0, http_errors_1.default)(404, "Company not found");
    if (existing.ownerUserId !== user.uid)
        throw (0, http_errors_1.default)(403, "Only the owner can delete this company");
    await repo.deleteCompanyById(companyId);
}
async function joinCompany(companyId, joinCode, user) {
    const company = await repo.findCompanyByJoinCode(joinCode);
    if (!company ||
        company._id.toString() !== companyId)
        throw (0, http_errors_1.default)(400, "Invalid join code");
    const clinics = await clinicService.listClinics(companyId);
    if (!clinics.length)
        throw (0, http_errors_1.default)(500, "No clinic exists to assign new member");
    await employeeService.addEmployee(companyId, clinics[0]._id.toString(), {
        email: user.email,
        name: user.name ?? "",
        role: "other",
        pictureUrl: user.picture ?? "",
    }, user.uid);
    return company;
}
async function joinByCode(joinCode, user) {
    const company = await repo.findCompanyByJoinCode(joinCode);
    if (!company)
        throw (0, http_errors_1.default)(400, "Invalid join code");
    const companyId = company._id.toString();
    const clinics = await clinicService.listClinics(companyId);
    if (!clinics.length)
        throw (0, http_errors_1.default)(500, "No clinic exists for company");
    await employeeService.addEmployee(companyId, clinics[0]._id.toString(), {
        email: user.email,
        name: user.name ?? "",
        role: "other",
        pictureUrl: user.picture ?? "",
    }, user.uid);
    return {
        companyId,
        companyName: company.name,
        clinics: clinics.map((c) => ({
            _id: c._id.toString(),
            name: c.name,
        })),
        ownerName: company.ownerName,
    };
}
async function leaveCompany(companyId, userEmail) {
    const company = await repo.findCompanyById(companyId);
    if (!company)
        throw (0, http_errors_1.default)(404, "Company not found");
    if (company.ownerEmail === userEmail)
        throw (0, http_errors_1.default)(400, "Owner cannot leave their own company");
    await employeeService.removeEmployeeByEmail(companyId, userEmail);
}
async function deleteUserAccount(user) {
    // Remove user from all employees in all companies
    await Company_1.default.updateMany({}, { $pull: { "employees.email": user.email } }).exec();
    await employeeService.deleteEmployeeByEmail(user.email);
    await firebase_admin_1.default.auth().deleteUser(user.uid);
}
async function listCompanies(user) {
    return repo.listCompaniesForUser({ uid: user.uid, email: user.email });
}
