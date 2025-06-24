"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertEmployee = upsertEmployee;
exports.listEmployees = listEmployees;
exports.removeEmployee = removeEmployee;
exports.addEmployee = addEmployee;
exports.updateEmployee = updateEmployee;
exports.deleteEmployee = deleteEmployee;
exports.createEmployee = createEmployee;
// src/dataAccess/employeeRepository.ts
const Employee_1 = __importDefault(require("../models/Employee"));
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = require("mongoose");
async function upsertEmployee(companyId, clinicId, userUid, data) {
    return Employee_1.default.findOneAndUpdate({
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
        userUid,
    }, { $set: data }, { new: true, upsert: true });
}
/**
 * List employees in a clinic/company, enriched with minimal user data.
 * Only returns: userId, name, pictureUrl, role, services, workingHours, companyId, clinicId.
 */
async function listEmployees(companyId, clinicId) {
    const filter = { companyId: new mongoose_1.Types.ObjectId(companyId) };
    if (clinicId)
        filter.clinicId = new mongoose_1.Types.ObjectId(clinicId);
    // Fetch employees
    const employees = await Employee_1.default.find(filter).lean();
    if (!employees.length)
        return [];
    // Gather all user UIDs (avoid duplicates)
    const userUids = [...new Set(employees.map((e) => e.userUid))];
    // Fetch user info in one query
    const users = await User_1.default.find({ uid: { $in: userUids } })
        .select({ uid: 1, name: 1, photoUrl: 1, memberships: 1 })
        .lean();
    // Map UID -> user object
    const userMap = {};
    for (const u of users)
        userMap[u.uid] = u;
    // Map each employee to EnrichedEmployee
    const result = employees.map((emp) => {
        const user = userMap[emp.userUid] ?? {};
        // Role from employee first, fallback to user's membership if available
        let role = emp.roles?.[0];
        if (!role && user.memberships && Array.isArray(user.memberships)) {
            // Try to match on companyId/clinicId for most accurate role
            const membership = user.memberships.find((m) => m.companyId === emp.companyId.toString() &&
                (!emp.clinicId || m.clinicId === emp.clinicId.toString()));
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
async function removeEmployee(companyId, clinicId, userUid) {
    return Employee_1.default.deleteOne({
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
        userUid,
    }).exec();
}
async function addEmployee(companyId, data) {
    return Employee_1.default.create({ ...data, companyId: new mongoose_1.Types.ObjectId(companyId) });
}
async function updateEmployee(employeeId, updates) {
    return Employee_1.default.findByIdAndUpdate(new mongoose_1.Types.ObjectId(employeeId), updates, {
        new: true,
    }).exec();
}
async function deleteEmployee(employeeId) {
    return Employee_1.default.findByIdAndDelete(new mongoose_1.Types.ObjectId(employeeId)).exec();
}
async function createEmployee(data) {
    return Employee_1.default.create(data);
}
