"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.findByIdWithAccessCheck = findByIdWithAccessCheck;
exports.updateByIdWithOwnerCheck = updateByIdWithOwnerCheck;
exports.deleteByIdWithCascade = deleteByIdWithCascade;
exports.listEmployees = listEmployees;
exports.addEmployee = addEmployee;
exports.updateEmployee = updateEmployee;
exports.deleteEmployee = deleteEmployee;
exports.joinCompany = joinCompany;
exports.getEmployeeSchedule = getEmployeeSchedule;
exports.getServices = getServices;
exports.deleteUserAccount = deleteUserAccount;
exports.leaveCompany = leaveCompany;
exports.findByEmail = findByEmail;
const Company_1 = __importDefault(require("../models/Company"));
const Appointment_1 = __importDefault(require("../models/Appointment"));
const Patient_1 = __importDefault(require("../models/Patient"));
const Message_1 = __importDefault(require("../models/Message"));
const Notification_1 = __importDefault(require("../models/Notification"));
const Worker_1 = __importDefault(require("../models/Worker"));
const Service_1 = __importDefault(require("../models/Service"));
const firebaseAdminService_1 = require("../thirdParty/firebaseAdminService");
function create(data) {
    return new Company_1.default(data).save();
}
function findByIdWithAccessCheck(companyId, email) {
    return Company_1.default.findOne({
        _id: companyId,
        $or: [{ ownerEmail: email }, { "employees.email": email }],
    }).exec();
}
function updateByIdWithOwnerCheck(companyId, email, updates) {
    return Company_1.default.findOneAndUpdate({ _id: companyId, ownerEmail: email }, updates, { new: true }).exec();
}
async function deleteByIdWithCascade(companyId, email) {
    const c = await Company_1.default.findOne({ _id: companyId, ownerEmail: email }).exec();
    if (!c)
        throw new Error(JSON.stringify({ status: 403, message: "Forbidden" }));
    await Promise.all([
        Appointment_1.default.deleteMany({ companyId }),
        Patient_1.default.deleteMany({ companyId }),
        Message_1.default.deleteMany({ companyId }),
        Notification_1.default.deleteMany({ companyId }),
        Worker_1.default.deleteMany({ companyId }),
        Service_1.default.deleteMany({ companyId }),
    ]);
    return Company_1.default.deleteOne({ _id: companyId }).exec();
}
function listEmployees(companyId) {
    return Company_1.default.findById(companyId).then((c) => {
        if (!c)
            throw new Error(JSON.stringify({ status: 404, message: "Company not found" }));
        const owner = {
            _id: "owner",
            email: c.ownerEmail,
            name: c.ownerName,
            role: "owner",
            pictureUrl: c.ownerImageUrl,
        };
        return [owner, ...c.employees];
    });
}
function addEmployee(companyId, dto) {
    return Company_1.default.findById(companyId).then((c) => {
        if (!c)
            throw new Error(JSON.stringify({ status: 404, message: "Company not found" }));
        c.employees.push(dto);
        return c.save().then(() => c.employees.slice(-1)[0]);
    });
}
function updateEmployee(companyId, employeeId, updates) {
    return Company_1.default.findById(companyId).then((c) => {
        if (!c)
            throw new Error(JSON.stringify({ status: 404, message: "Company not found" }));
        const emp = c.employees.id(employeeId);
        if (!emp)
            throw new Error(JSON.stringify({ status: 404, message: "Employee not found" }));
        Object.assign(emp, updates);
        return c.save().then(() => emp);
    });
}
function deleteEmployee(companyId, employeeId) {
    return Company_1.default.findById(companyId).then((c) => {
        if (!c)
            throw new Error(JSON.stringify({ status: 404, message: "Company not found" }));
        c.employees = c.employees.filter((e) => e._id.toString() !== employeeId);
        return c.save();
    });
}
function joinCompany(companyId, joinCode, user) {
    return Company_1.default.findById(companyId).then((c) => {
        if (!c)
            throw new Error(JSON.stringify({ status: 404, message: "Company not found" }));
        if (joinCode !== companyId)
            throw new Error(JSON.stringify({ status: 400, message: "Invalid joinCode" }));
        if (c.ownerEmail === user.email)
            throw new Error(JSON.stringify({ status: 409, message: "Owner cannot join" }));
        if (c.employees.some((e) => e.email === user.email)) {
            throw new Error(JSON.stringify({ status: 409, message: "Already an employee" }));
        }
        c.employees.push({
            email: user.email,
            name: user.name,
            pictureUrl: user.picture,
            role: "staff",
        });
        return c.save().then(() => ({ message: "Joined", employees: c.employees }));
    });
}
function getEmployeeSchedule(companyId, employeeId, requesterEmail) {
    return Company_1.default.findById(companyId).then(async (c) => {
        if (!c)
            throw new Error(JSON.stringify({ status: 404, message: "Company not found" }));
        const isOwner = c.ownerEmail === requesterEmail;
        const isSelf = c.employees.some((e) => e.email === requesterEmail && e.email === employeeId);
        if (!isOwner && !isSelf)
            throw new Error(JSON.stringify({ status: 403, message: "Forbidden" }));
        return Appointment_1.default.find({ companyId, employeeEmail: employeeId }).exec();
    });
}
function getServices(companyId) {
    return Company_1.default.findById(companyId).then((c) => {
        if (!c)
            throw new Error(JSON.stringify({ status: 404, message: "Company not found" }));
        return c.services;
    });
}
function deleteUserAccount(email, uid) {
    return Company_1.default.updateMany({}, { $pull: { employees: { email } } }).then(async () => {
        if (uid) {
            await firebaseAdminService_1.auth.deleteUser(uid);
        }
    });
}
async function leaveCompany(companyId, userEmail) {
    const c = await Company_1.default.findById(companyId).exec();
    if (!c)
        throw new Error(JSON.stringify({ status: 404, message: "Company not found" }));
    if (c.ownerEmail === userEmail)
        throw new Error(JSON.stringify({ status: 400, message: "Owner cannot leave" }));
    c.employees = c.employees.filter((e) => e.email !== userEmail);
    await c.save();
}
/**
 * Find the company where the given email is either owner or employee.
 */
function findByEmail(email) {
    return Company_1.default.findOne({
        $or: [{ ownerEmail: email }, { "employees.email": email }],
    }).exec();
}
