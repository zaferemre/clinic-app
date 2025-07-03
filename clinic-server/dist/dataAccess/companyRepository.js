"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompany = createCompany;
exports.findCompanyById = findCompanyById;
exports.findCompanyByJoinCode = findCompanyByJoinCode;
exports.updateCompanyById = updateCompanyById;
exports.deleteCompanyById = deleteCompanyById;
exports.listEmployees = listEmployees;
exports.addClinicToCompany = addClinicToCompany;
exports.deleteAllClinicsByCompanyId = deleteAllClinicsByCompanyId;
const Clinic_1 = __importDefault(require("../models/Clinic"));
const Company_1 = __importDefault(require("../models/Company"));
const Employee_1 = __importDefault(require("../models/Employee"));
async function createCompany(doc) {
    return Company_1.default.create(doc);
}
async function findCompanyById(id) {
    return Company_1.default.findById(id).populate("clinics").exec();
}
async function findCompanyByJoinCode(code) {
    return Company_1.default.findOne({ joinCode: code }).exec();
}
async function updateCompanyById(id, updates) {
    return Company_1.default.findByIdAndUpdate(id, updates, { new: true }).exec();
}
async function deleteCompanyById(id) {
    return Company_1.default.findByIdAndDelete(id).exec();
}
async function listEmployees(companyId) {
    return Employee_1.default.find({ companyId }).exec();
}
async function addClinicToCompany(companyId, clinicId) {
    return Company_1.default.findByIdAndUpdate(companyId, { $addToSet: { clinics: clinicId } }, { new: true }).exec();
}
async function deleteAllClinicsByCompanyId(companyId) {
    return Clinic_1.default.deleteMany({ companyId }).exec();
}
