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
const companyRepo = __importStar(require("../dataAccess/companyRepository"));
const cacheHelpers_1 = require("../utils/cacheHelpers");
const employeeRepo = __importStar(require("../dataAccess/employeeRepository"));
const mongoose_1 = require("mongoose");
const roleRepo = __importStar(require("../dataAccess/roleRepository"));
/**
 * List all clinics for a company (with cache)
 */
async function listClinics(companyId) {
    const cacheKey = `company:${companyId}:clinics`;
    return (0, cacheHelpers_1.getOrSetCache)(cacheKey, () => clinicRepo.listClinics(companyId));
}
/**
 * Create a new clinic in the company...
 */ async function createClinic(companyId, data, uid) {
    // Always use Types.ObjectId for all ids
    const companyObjectId = new mongoose_1.Types.ObjectId(companyId);
    // 1. Create the clinic
    const clinic = await clinicRepo.createClinic({
        ...data,
        companyId: companyObjectId,
    });
    // 2. Get company for name (optional)
    const company = await companyRepo.findCompanyById(companyObjectId);
    const companyName = company?.name ?? "";
    // 3. Create employee record for the owner
    await employeeRepo.createEmployee({
        userUid: uid,
        companyId: companyObjectId,
        clinicId: clinic._id,
        roles: ["owner"],
        isActive: true,
        services: [],
        workingHours: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    // 4. Add membership with ObjectId references
    await userRepo.addMembership(uid, {
        companyId: companyObjectId,
        companyName: companyName,
        clinicId: clinic._id,
        clinicName: clinic.name,
        roles: ["owner"],
    });
    await roleRepo.createRole({
        companyId: companyObjectId,
        clinicId: clinic._id,
        name: "Admin",
        isDefault: true,
        createdBy: uid,
    });
    // 5. Add clinic to company
    await companyRepo.addClinicToCompany(companyObjectId, clinic._id);
    // 6. Invalidate company clinics cache
    await (0, cacheHelpers_1.invalidateCache)(`company:${companyId}:clinics`);
    return clinic;
}
async function getClinicById(companyId, clinicId) {
    const cacheKey = `clinic:${clinicId}`;
    return (0, cacheHelpers_1.getOrSetCache)(cacheKey, () => clinicRepo.findClinicById(companyId, clinicId));
}
async function updateClinic(clinicId, updates) {
    const updated = await clinicRepo.updateClinicById(clinicId, updates);
    // Invalidate cache for this clinic and for all clinics in the parent company
    if (updated?.companyId) {
        await (0, cacheHelpers_1.invalidateCache)(`company:${updated.companyId.toString()}:clinics`);
    }
    await (0, cacheHelpers_1.invalidateCache)(`clinic:${clinicId}`);
    return updated;
}
async function deleteClinic(clinicId) {
    // Find first so we can invalidate company clinics cache
    const clinic = await clinicRepo.findClinicById(undefined, clinicId); // fudge companyId as not needed here
    const result = await clinicRepo.deleteClinicById(clinicId);
    if (clinic?.companyId) {
        await (0, cacheHelpers_1.invalidateCache)(`company:${clinic.companyId.toString()}:clinics`);
    }
    await (0, cacheHelpers_1.invalidateCache)(`clinic:${clinicId}`);
    return result;
}
