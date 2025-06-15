"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRoles = listRoles;
exports.addRole = addRole;
exports.updateRole = updateRole;
exports.deleteRole = deleteRole;
const Company_1 = __importDefault(require("../models/Company"));
function listRoles(companyId) {
    return Company_1.default.findById(companyId).then((c) => c?.roles ?? []);
}
function addRole(companyId, role) {
    return Company_1.default.findById(companyId).then((c) => {
        if (!c)
            throw new Error(JSON.stringify({ status: 404, message: "Company not found" }));
        if (c.roles.includes(role))
            throw new Error(JSON.stringify({ status: 409, message: "Role exists" }));
        c.roles.push(role);
        // No need to update employee roles here, as oldRole/newRole are not defined in this context
        return c.save().then(() => c.roles);
    });
}
function updateRole(companyId, oldRole, newRole) {
    return Company_1.default.findById(companyId).then((c) => {
        if (!c)
            throw new Error(JSON.stringify({ status: 404, message: "Company not found" }));
        const idx = c.roles.indexOf(oldRole);
        if (idx === -1)
            throw new Error(JSON.stringify({ status: 404, message: "Role not found" }));
        c.roles[idx] = newRole;
        c.employees.forEach((e) => {
            if (e.role === oldRole)
                e.role = newRole;
        });
        return c.save().then(() => c.roles);
    });
}
function deleteRole(companyId, role) {
    return Company_1.default.findById(companyId).then((c) => {
        if (!c)
            throw new Error(JSON.stringify({ status: 404, message: "Company not found" }));
        if (!c.roles.includes(role))
            throw new Error(JSON.stringify({ status: 404, message: "Role not found" }));
        c.roles = c.roles.filter((r) => r !== role);
        c.employees.forEach((e) => {
            if (e.role === role)
                e.role = "staff";
        });
        return c.save().then(() => c.roles);
    });
}
