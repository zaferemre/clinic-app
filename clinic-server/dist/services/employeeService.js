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
exports.upsertEmployee = upsertEmployee;
exports.listEmployees = listEmployees;
exports.removeEmployee = removeEmployee;
exports.createEmployee = createEmployee;
exports.updateEmployee = updateEmployee;
exports.deleteEmployee = deleteEmployee;
const empRepo = __importStar(require("../dataAccess/employeeRepository"));
const User_1 = __importDefault(require("../models/User"));
// Çalışanı ekle/güncelle (upsert)
async function upsertEmployee(companyId, clinicId, userUid, data) {
    if (data.roles && !Array.isArray(data.roles))
        data.roles = [data.roles];
    return empRepo.upsertEmployee(companyId, clinicId, userUid, data);
}
// Tüm çalışanları listeler (enriched, user datası ile)
async function listEmployees(companyId, clinicId) {
    const employees = await empRepo.listEmployees(companyId, clinicId);
    if (!employees.length)
        return [];
    const userUids = [...new Set(employees.map((e) => e.userUid))];
    const users = await User_1.default.find({ uid: { $in: userUids } })
        .select({ uid: 1, name: 1, photoUrl: 1, memberships: 1 })
        .lean();
    const userMap = {};
    users.forEach((u) => (userMap[u.uid] = u));
    return employees.map((emp) => {
        const user = userMap[emp.userUid] ?? {};
        let roles = Array.isArray(emp.roles) ? emp.roles : [];
        if ((!roles || roles.length === 0) &&
            user.memberships &&
            Array.isArray(user.memberships)) {
            const membership = user.memberships.find((m) => m.companyId?.toString() === emp.companyId.toString() &&
                (!emp.clinicId || m.clinicId?.toString() === emp.clinicId.toString()));
            if (membership?.roles?.length)
                roles = membership.roles;
        }
        return {
            _id: emp._id?.toString(),
            userUid: emp.userUid,
            name: user.name ?? "—",
            pictureUrl: user.photoUrl ?? "",
            roles: roles ?? [],
            services: emp.services ?? [],
            workingHours: emp.workingHours ?? [],
            companyId: emp.companyId.toString(),
            clinicId: emp.clinicId?.toString() ?? "",
        };
    });
}
// Çalışanı sil (userUid ile)
async function removeEmployee(companyId, clinicId, userUid) {
    return empRepo.removeEmployee(companyId, clinicId, userUid);
}
// Yeni çalışan oluştur
async function createEmployee(data) {
    if (data.roles && !Array.isArray(data.roles))
        data.roles = [data.roles];
    return empRepo.createEmployee(data);
}
// Çalışan güncelle (employeeId ile)
// NOT: User.memberships'daki rol de güncellenir!
async function updateEmployee(employeeId, data) {
    if (data.roles && !Array.isArray(data.roles))
        data.roles = [data.roles];
    const emp = await empRepo.updateEmployee(employeeId, data);
    // Sadece klinik membership'ını güncelle
    if (data.roles && emp && emp.clinicId) {
        const companyIdStr = emp.companyId.toString();
        const clinicIdStr = emp.clinicId.toString();
        // Sadece klinik membership'ı update et
        await User_1.default.updateOne({
            uid: emp.userUid,
            memberships: {
                $elemMatch: {
                    companyId: companyIdStr,
                    clinicId: clinicIdStr,
                },
            },
        }, { $set: { "memberships.$.roles": data.roles } });
    }
    return emp;
}
// Çalışanı sil (employeeId ile)
async function deleteEmployee(employeeId) {
    return empRepo.deleteEmployee(employeeId);
}
