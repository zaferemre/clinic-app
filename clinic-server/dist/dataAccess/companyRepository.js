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
const Company_1 = __importDefault(require("../models/Company"));
const Appointment_1 = __importDefault(require("../models/Appointment"));
const Patient_1 = __importDefault(require("../models/Patient"));
const Group_1 = __importDefault(require("../models/Group"));
const Notification_1 = __importDefault(require("../models/Notification"));
const Message_1 = __importDefault(require("../models/Message"));
const Service_1 = __importDefault(require("../models/Service"));
const Role_1 = __importDefault(require("../models/Role"));
const Clinic_1 = __importDefault(require("../models/Clinic"));
async function createCompany(doc) {
    return Company_1.default.create(doc);
}
async function findCompanyById(id) {
    return Company_1.default.findById(id).populate("clinics").populate("roles").exec();
}
async function findCompanyByJoinCode(code) {
    return Company_1.default.findOne({ joinCode: code }).exec();
}
async function listCompaniesByOwner(ownerId) {
    return Company_1.default.find({ ownerUserId: ownerId }).exec();
}
async function updateCompanyById(id, updates) {
    return Company_1.default.findByIdAndUpdate(id, updates, { new: true }).exec();
}
async function deleteCompanyById(id) {
    await Promise.all([
        Appointment_1.default.deleteMany({ companyId: id }).exec(),
        Patient_1.default.deleteMany({ companyId: id }).exec(),
        Group_1.default.deleteMany({ companyId: id }).exec(),
        Notification_1.default.deleteMany({ companyId: id }).exec(),
        Message_1.default.deleteMany({ companyId: id }).exec(),
        Service_1.default.deleteMany({ companyId: id }).exec(),
        Role_1.default.deleteMany({ companyId: id }).exec(),
        Clinic_1.default.deleteMany({ companyId: id }).exec(),
        Company_1.default.findByIdAndDelete(id).exec(),
    ]);
}
