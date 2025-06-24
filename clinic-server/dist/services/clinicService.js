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
exports.listClinics = listClinics;
exports.createClinic = createClinic;
exports.getClinicById = getClinicById;
exports.updateClinic = updateClinic;
exports.deleteClinic = deleteClinic;
const clinicRepo = __importStar(require("../dataAccess/clinicRepository"));
const userRepo = __importStar(require("../dataAccess/userRepository"));
const employeeRepo = __importStar(require("../dataAccess/employeeRepository"));
const companyRepo = __importStar(require("../dataAccess/companyRepository"));
const mongoose_1 = require("mongoose");
/**
 * List all clinics for a company
 */
async function listClinics(companyId) {
    return clinicRepo.listClinics(companyId);
}
/**
 * Create a new clinic in the company, add the user as:
 * - Clinic admin (employee)
 * - UserMembership entry for the clinic
 * - Push the clinicId to the parent company's clinics array
 */
async function createClinic(companyId, data, uid) {
    // 1. Create the clinic
    const clinic = await clinicRepo.createClinic({
        ...data,
        companyId,
    });
    // 2. Fetch company for name
    const company = await companyRepo.findCompanyById(companyId);
    const companyName = company?.name ?? "";
    // 3. Add employee (admin) to this clinic
    await employeeRepo.createEmployee({
        userUid: uid,
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: clinic._id,
        roles: ["owner"],
        isActive: true,
    });
    // 4. Add clinic membership to the user
    await userRepo.addMembership(uid, {
        companyId: companyId,
        companyName: companyName,
        clinicId: clinic._id.toString(),
        clinicName: clinic.name,
        roles: ["owner"],
    });
    // 5. Add clinicId to company.clinics array
    await companyRepo.addClinicToCompany(companyId, clinic._id);
    return clinic;
}
async function getClinicById(companyId, clinicId) {
    return clinicRepo.findClinicById(companyId, clinicId);
}
async function updateClinic(clinicId, updates) {
    return clinicRepo.updateClinicById(clinicId, updates);
}
async function deleteClinic(clinicId) {
    return clinicRepo.deleteClinicById(clinicId);
}
