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
exports.createCompany = createCompany;
exports.getCompanyById = getCompanyById;
exports.getCompaniesForUser = getCompaniesForUser;
exports.updateCompany = updateCompany;
exports.deleteCompany = deleteCompany;
exports.joinByCode = joinByCode;
exports.leaveCompany = leaveCompany;
exports.listEmployees = listEmployees;
const companyRepo = __importStar(require("../dataAccess/companyRepository"));
const userRepo = __importStar(require("../dataAccess/userRepository"));
const uuid_1 = require("uuid");
/**
 * Create a new company and add the creating user as the owner in their memberships.
 */
async function createCompany(uid, data) {
    // 1. Create the company document
    const company = await companyRepo.createCompany({
        ...data,
        ownerUid: uid,
        joinCode: (0, uuid_1.v4)(),
    });
    // 2. Add owner membership to user
    await userRepo.addMembership(uid, {
        companyId: company._id.toString(),
        companyName: company.name,
        roles: ["owner"],
    });
    return company;
}
/**
 * Find a company by its ID.
 */
async function getCompanyById(companyId) {
    return companyRepo.findCompanyById(companyId);
}
/**
 * Get all company memberships for a user.
 */
async function getCompaniesForUser(uid) {
    const user = await userRepo.findByUid(uid);
    return user?.memberships || [];
}
/**
 * Update company details (owner only).
 */
async function updateCompany(companyId, updates, uid) {
    const company = await companyRepo.findCompanyById(companyId);
    if (!company)
        throw new Error("Company not found");
    if (company.ownerUid !== uid)
        throw new Error("Unauthorized");
    return companyRepo.updateCompanyById(companyId, updates);
}
/**
 * Delete a company (owner only), **and delete all child clinics**.
 */
async function deleteCompany(companyId, uid) {
    const company = await companyRepo.findCompanyById(companyId);
    if (!company)
        throw new Error("Company not found");
    if (company.ownerUid !== uid)
        throw new Error("Unauthorized");
    // Also delete all clinics under this company
    await companyRepo.deleteAllClinicsByCompanyId(companyId);
    return companyRepo.deleteCompanyById(companyId);
}
/**
 * Join a company by invite code.
 */
async function joinByCode(uid, code) {
    const company = await companyRepo.findCompanyByJoinCode(code);
    if (!company)
        return { success: false, message: "Invalid code" };
    // Add membership (avoid duplicate)
    await userRepo.addMembership(uid, {
        companyId: company._id.toString(),
        companyName: company.name,
        roles: ["staff"],
    });
    return {
        success: true,
        companyId: company._id.toString(),
        companyName: company.name,
    };
}
/**
 * Leave a company (removes user's membership for this company).
 */
async function leaveCompany(uid, companyId) {
    await userRepo.removeMembership(uid, companyId, "");
    return { success: true, message: "Left company" };
}
/**
 * List all employees for a company.
 */
async function listEmployees(companyId) {
    return companyRepo.listEmployees(companyId);
}
