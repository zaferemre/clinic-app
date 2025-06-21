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
exports.listClinics = listClinics;
exports.createClinic = createClinic;
exports.getClinic = getClinic;
exports.updateClinic = updateClinic;
exports.deleteClinic = deleteClinic;
const http_errors_1 = __importDefault(require("http-errors"));
const repo = __importStar(require("../dataAccess/clinicRepository"));
const mongoose_1 = __importDefault(require("mongoose"));
async function listClinics(companyId) {
    return repo.listClinics(companyId);
}
async function createClinic(companyId, data) {
    if (!data.name)
        throw (0, http_errors_1.default)(400, "Clinic name is required");
    const clinic = await repo.createClinic({
        ...data,
        companyId: new mongoose_1.default.Types.ObjectId(companyId),
        isActive: true,
    });
    return clinic;
}
async function getClinic(companyId, clinicId) {
    const clinic = await repo.findClinicById(companyId, clinicId);
    if (!clinic)
        throw (0, http_errors_1.default)(404, "Clinic not found");
    return clinic;
}
async function updateClinic(companyId, clinicId, updates) {
    return repo.updateClinicById(clinicId, updates);
}
async function deleteClinic(companyId, clinicId) {
    await repo.deleteClinicById(clinicId);
}
