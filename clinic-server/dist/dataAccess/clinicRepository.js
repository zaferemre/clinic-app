"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listClinics = listClinics;
exports.createClinic = createClinic;
exports.findClinicById = findClinicById;
exports.updateClinicById = updateClinicById;
exports.deleteClinicById = deleteClinicById;
const Clinic_1 = __importDefault(require("../models/Clinic"));
const mongoose_1 = __importDefault(require("mongoose"));
// List all clinics for a company
async function listClinics(companyId) {
    return Clinic_1.default.find({
        companyId: new mongoose_1.default.Types.ObjectId(companyId),
    }).exec();
}
// Create a new Clinic document
async function createClinic(doc) {
    return Clinic_1.default.create(doc);
}
// Find clinic by ID and companyId
async function findClinicById(companyId, clinicId) {
    return Clinic_1.default.findOne({
        _id: new mongoose_1.default.Types.ObjectId(clinicId),
        companyId: new mongoose_1.default.Types.ObjectId(companyId),
    }).exec();
}
// Update a clinic by its ID
function updateClinicById(clinicId, updates) {
    return Clinic_1.default.findByIdAndUpdate(clinicId, updates, { new: true }).exec();
}
// Delete a clinic by its ID
function deleteClinicById(clinicId) {
    return Clinic_1.default.findByIdAndDelete(clinicId).exec();
}
