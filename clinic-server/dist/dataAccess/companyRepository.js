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
exports.listCompaniesForUser = listCompaniesForUser;
const Company_1 = __importDefault(require("../models/Company"));
const Appointment_1 = __importDefault(require("../models/Appointment"));
const Patient_1 = __importDefault(require("../models/Patient"));
const Group_1 = __importDefault(require("../models/Group"));
const Notification_1 = __importDefault(require("../models/Notification"));
const Message_1 = __importDefault(require("../models/Message"));
const Service_1 = __importDefault(require("../models/Service"));
const Role_1 = __importDefault(require("../models/Role"));
const Clinic_1 = __importDefault(require("../models/Clinic"));
const Employee_1 = __importDefault(require("../models/Employee"));
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
/**
 * Returns all companies where user is owner or employee (by email).
 */
async function listCompaniesForUser(user) {
    // 1. Owned companies
    const ownedCompanies = await Company_1.default.find({ ownerUserId: user.uid });
    // 2. Employees with this email
    const employees = await Employee_1.default.find({ email: user.email });
    const clinicIds = employees.map((emp) => emp.clinicId);
    // 3. Clinics where user is an employee
    const clinics = await Clinic_1.default.find({ _id: { $in: clinicIds } });
    const companyIdsFromClinics = clinics.map((clinic) => clinic.companyId instanceof Object
        ? clinic.companyId.toString()
        : clinic.companyId);
    // 4. Companies by those IDs
    const memberCompanies = await Company_1.default.find({
        _id: { $in: companyIdsFromClinics },
    });
    // 5. Merge, dedupe by _id
    const allCompanies = [
        ...ownedCompanies,
        ...memberCompanies.filter((mc) => !ownedCompanies.some((oc) => oc._id &&
            typeof oc._id === "object" &&
            "equals" in oc._id &&
            typeof oc._id.equals === "function" &&
            oc._id.equals(mc._id))),
    ];
    return allCompanies;
}
