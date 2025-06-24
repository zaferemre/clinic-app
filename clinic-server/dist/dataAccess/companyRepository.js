"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompany = createCompany;
exports.findCompanyById = findCompanyById;
exports.findCompanyByJoinCode = findCompanyByJoinCode;
exports.listCompaniesByOwner = listCompaniesByOwner;
exports.updateCompanyById = updateCompanyById;
exports.deleteCompanyById = deleteCompanyById;
exports.listEmployees = listEmployees;
const Company_1 = __importDefault(require("../models/Company"));
const Employee_1 = __importDefault(require("../models/Employee"));
const mongoose_1 = require("mongoose");
// Create a company
async function createCompany(doc) {
    return Company_1.default.create(doc);
}
// Find a company by its ID
async function findCompanyById(id) {
    return Company_1.default.findById(new mongoose_1.Types.ObjectId(id))
        .populate("clinics")
        .populate("roles")
        .exec();
}
// Find a company by join code
async function findCompanyByJoinCode(code) {
    return Company_1.default.findOne({ joinCode: code }).exec();
}
// List companies by owner
async function listCompaniesByOwner(ownerUserId) {
    return Company_1.default.find({ ownerUserId }).exec();
}
// Update a company
async function updateCompanyById(id, updates) {
    return Company_1.default.findByIdAndUpdate(new mongoose_1.Types.ObjectId(id), updates, {
        new: true,
    }).exec();
}
// Delete a company
async function deleteCompanyById(id) {
    return Company_1.default.findByIdAndDelete(new mongoose_1.Types.ObjectId(id)).exec();
}
// List all employees for a company
async function listEmployees(companyId) {
    return Employee_1.default.find({ companyId: new mongoose_1.Types.ObjectId(companyId) }).exec();
}
