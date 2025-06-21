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
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRoles = listRoles;
exports.addRole = addRole;
exports.updateRole = updateRole;
exports.deleteRole = deleteRole;
const repoRole = __importStar(require("../dataAccess/roleRepository"));
const mongoose_1 = require("mongoose");
async function listRoles(companyId, clinicId) {
    return repoRole.listRoles(companyId, clinicId);
}
async function addRole(companyId, clinicId, data) {
    const doc = {
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
        name: data.name,
        createdBy: data.createdBy ? new mongoose_1.Types.ObjectId(data.createdBy) : undefined,
        isDefault: false,
    };
    return repoRole.createRole(doc);
}
async function updateRole(companyId, clinicId, roleId, updates) {
    // Optional: verify role belongs to this company+clinic before updating
    return repoRole.updateRoleById(roleId, updates);
}
async function deleteRole(companyId, clinicId, roleId) {
    // Optional: verify role belongs to this company+clinic before deleting
    return repoRole.deleteRoleById(roleId);
}
