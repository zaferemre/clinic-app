"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClinic = createClinic;
exports.listClinics = listClinics;
exports.findClinicById = findClinicById;
exports.updateClinicById = updateClinicById;
exports.deleteClinicById = deleteClinicById;
const Clinic_1 = __importDefault(require("../models/Clinic"));
async function createClinic(doc) {
    return Clinic_1.default.create(doc);
}
async function listClinics(companyId) {
    return Clinic_1.default.find({ companyId });
}
async function findClinicById(companyId, clinicId) {
    return Clinic_1.default.findOne({ _id: clinicId, companyId });
}
async function updateClinicById(clinicId, updates) {
    return Clinic_1.default.findByIdAndUpdate(clinicId, updates, { new: true });
}
async function deleteClinicById(clinicId) {
    return Clinic_1.default.findByIdAndDelete(clinicId);
}
