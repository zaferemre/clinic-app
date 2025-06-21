"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRoles = listRoles;
exports.createRole = createRole;
exports.updateRoleById = updateRoleById;
exports.deleteRoleById = deleteRoleById;
// dataAccess/roleRepository.ts
const Role_1 = __importDefault(require("../models/Role"));
const mongoose_1 = require("mongoose");
async function listRoles(companyId) {
    return Role_1.default.find({ companyId: new mongoose_1.Types.ObjectId(companyId) });
}
async function createRole(doc) {
    return Role_1.default.create(doc);
}
async function updateRoleById(roleId, updates) {
    return Role_1.default.findByIdAndUpdate(roleId, updates, { new: true });
}
async function deleteRoleById(roleId) {
    await Role_1.default.findByIdAndDelete(roleId);
}
