"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRoles = listRoles;
exports.createRole = createRole;
exports.updateRoleById = updateRoleById;
exports.deleteRoleById = deleteRoleById;
const Role_1 = __importDefault(require("../models/Role"));
const mongoose_1 = require("mongoose");
function listRoles(companyId, clinicId) {
    return Role_1.default.find({
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
    }).exec();
}
function createRole(doc) {
    return new Role_1.default(doc).save();
}
function updateRoleById(roleId, updates) {
    return Role_1.default.findByIdAndUpdate(roleId, updates, { new: true }).exec();
}
function deleteRoleById(roleId) {
    return Role_1.default.findByIdAndDelete(roleId).exec();
}
