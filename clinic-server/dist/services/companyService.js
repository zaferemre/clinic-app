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
exports.getCompany = getCompany;
exports.updateCompany = updateCompany;
exports.deleteCompany = deleteCompany;
exports.listEmployees = listEmployees;
exports.addEmployee = addEmployee;
exports.updateEmployee = updateEmployee;
exports.deleteEmployee = deleteEmployee;
exports.joinCompany = joinCompany;
exports.leaveCompany = leaveCompany;
exports.getEmployeeSchedule = getEmployeeSchedule;
exports.updateWorkingHours = updateWorkingHours;
exports.updateServices = updateServices;
exports.getServices = getServices;
exports.deleteUserAccount = deleteUserAccount;
const repo = __importStar(require("../dataAccess/companyRepository"));
/**
 * Create a new company with the authenticated user as owner.
 */
function createCompany(user, body) {
    return repo.create({
        ownerEmail: user.email,
        ownerName: user.name || "",
        ownerImageUrl: user.picture || "",
        ...body,
        roles: ["owner", "admin", "manager", "staff"],
        employees: [
            {
                email: user.email,
                name: user.name,
                pictureUrl: user.picture,
                role: "owner",
            },
        ],
    });
}
/**
 * Get the company for the user. If companyId is provided, enforce access check.
 * If companyId is undefined, look up by the authenticated user's email.
 */
async function getCompany(companyId, user) {
    let company;
    if (companyId) {
        company = await repo.findByIdWithAccessCheck(companyId, user.email);
    }
    else {
        company = await repo.findByEmail(user.email);
    }
    if (!company) {
        const err = new Error("Company not found");
        err.status = 404;
        throw err;
    }
    return company;
}
/**
 * Update top-level company fields. Only owner may call.
 */
function updateCompany(companyId, updates, user) {
    return repo.updateByIdWithOwnerCheck(companyId, user.email, updates);
}
/**
 * Delete a company and cascade-remove data. Only owner may call.
 */
async function deleteCompany(companyId, user) {
    await repo.deleteByIdWithCascade(companyId, user.email);
}
/**
 * List employees (including owner) for a company.
 */
function listEmployees(companyId) {
    return repo.listEmployees(companyId);
}
/**
 * Add a new employee record.
 */
function addEmployee(companyId, dto) {
    return repo.addEmployee(companyId, dto);
}
/**
 * Update an existing employee by subdocument ID.
 */
function updateEmployee(companyId, employeeId, updates) {
    return repo.updateEmployee(companyId, employeeId, updates);
}
/**
 * Remove an employee by subdocument ID.
 */
function deleteEmployee(companyId, employeeId) {
    return repo.deleteEmployee(companyId, employeeId);
}
/**
 * Join a company using a join code. Authenticated user cannot be owner.
 */
function joinCompany(companyId, joinCode, user) {
    return repo.joinCompany(companyId, joinCode, user);
}
/**
 * Leave a company. Owner cannot leave.
 */
function leaveCompany(companyId, userEmail) {
    return repo.leaveCompany(companyId, userEmail);
}
/**
 * Get schedule for an employee. Owner can view all; employees only their own.
 */
function getEmployeeSchedule(companyId, employeeId, requesterEmail) {
    return repo.getEmployeeSchedule(companyId, employeeId, requesterEmail);
}
/**
 * Update the company's working hours. Only owner may call.
 */
function updateWorkingHours(companyId, workingHours, user) {
    return repo.updateByIdWithOwnerCheck(companyId, user.email, { workingHours });
}
/**
 * Update the company's services. Only owner may call.
 */
function updateServices(companyId, services, user) {
    return repo.updateByIdWithOwnerCheck(companyId, user.email, { services });
}
/**
 * Fetch the company's services (no ACL required beyond existence).
 */
function getServices(companyId) {
    return repo.getServices(companyId);
}
/**
 * Delete the current user's account and remove from companies.
 */
function deleteUserAccount(email, uid) {
    return repo.deleteUserAccount(email, uid);
}
