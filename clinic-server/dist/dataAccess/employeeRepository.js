"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertEmployee = upsertEmployee;
exports.listEmployees = listEmployees;
exports.removeEmployee = removeEmployee;
exports.updateEmployee = updateEmployee;
exports.deleteEmployee = deleteEmployee;
exports.createEmployee = createEmployee;
const Employee_1 = __importDefault(require("../models/Employee"));
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = require("mongoose");
// Upsert (create if not exists, update otherwise)
async function upsertEmployee(companyId, clinicId, userUid, data) {
    const cId = companyId instanceof mongoose_1.Types.ObjectId
        ? companyId
        : new mongoose_1.Types.ObjectId(companyId);
    const clId = clinicId instanceof mongoose_1.Types.ObjectId
        ? clinicId
        : new mongoose_1.Types.ObjectId(clinicId);
    return Employee_1.default.findOneAndUpdate({
        companyId: cId,
        clinicId: clId,
        userUid,
    }, { $set: { ...data, companyId: cId, clinicId: clId, userUid } }, { new: true, upsert: true }).exec();
}
// List employees, with enrichment
async function listEmployees(companyId, clinicId) {
    const cId = companyId instanceof mongoose_1.Types.ObjectId
        ? companyId
        : new mongoose_1.Types.ObjectId(companyId);
    const filter = { companyId: cId };
    if (clinicId)
        filter.clinicId =
            clinicId instanceof mongoose_1.Types.ObjectId
                ? clinicId
                : new mongoose_1.Types.ObjectId(clinicId);
    const employees = await Employee_1.default.find(filter).lean();
    if (!employees.length)
        return [];
    const userUids = [...new Set(employees.map((e) => e.userUid))];
    const users = await User_1.default.find({ uid: { $in: userUids } })
        .select({ uid: 1, name: 1, photoUrl: 1, memberships: 1 })
        .lean();
    // Map UID -> user
    const userMap = {};
    users.forEach((u) => (userMap[u.uid] = u));
    const result = employees.map((emp) => {
        const user = userMap[emp.userUid] ?? {};
        // Best role match logic
        let role = emp.roles?.[0];
        if (!role && user.memberships && Array.isArray(user.memberships)) {
            const membership = user.memberships.find((m) => m.companyId?.toString() === emp.companyId.toString() &&
                (!emp.clinicId || m.clinicId?.toString() === emp.clinicId.toString()));
            role = membership?.roles?.[0] ?? "employee";
        }
        return {
            userId: emp.userUid,
            name: user.name ?? "—",
            pictureUrl: user.photoUrl ?? "",
            role: role ?? "employee",
            services: emp.services ?? [],
            workingHours: emp.workingHours ?? [],
            companyId: emp.companyId.toString(),
            clinicId: emp.clinicId?.toString() ?? "",
        };
    });
    return result;
}
// Remove one employee by company, clinic, user
async function removeEmployee(companyId, clinicId, userUid) {
    const cId = companyId instanceof mongoose_1.Types.ObjectId
        ? companyId
        : new mongoose_1.Types.ObjectId(companyId);
    const clId = clinicId instanceof mongoose_1.Types.ObjectId
        ? clinicId
        : new mongoose_1.Types.ObjectId(clinicId);
    return Employee_1.default.deleteOne({
        companyId: cId,
        clinicId: clId,
        userUid,
    }).exec();
}
// Update by employeeId
async function updateEmployee(employeeId, updates) {
    const eId = employeeId instanceof mongoose_1.Types.ObjectId
        ? employeeId
        : new mongoose_1.Types.ObjectId(employeeId);
    return Employee_1.default.findByIdAndUpdate(eId, updates, { new: true }).exec();
}
// Delete by employeeId
async function deleteEmployee(employeeId) {
    const eId = employeeId instanceof mongoose_1.Types.ObjectId
        ? employeeId
        : new mongoose_1.Types.ObjectId(employeeId);
    return Employee_1.default.findByIdAndDelete(eId).exec();
}
// Only use this for "raw" creates (not for upsert logic)
async function createEmployee(data) {
    return Employee_1.default.create(data);
}
