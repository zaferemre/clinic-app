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
exports.deleteRole = exports.updateRole = exports.addRole = exports.listRoles = void 0;
const roleService = __importStar(require("../services/roleService"));
// List roles
const listRoles = async (req, res, next) => {
    try {
        const roles = await roleService.listRoles(req.params.companyId, req.params.clinicId);
        res.json(roles);
    }
    catch (err) {
        next(err);
    }
};
exports.listRoles = listRoles;
// Create role
const addRole = async (req, res, next) => {
    try {
        // Use authenticated UID, fallback to request if necessary
        const uid = req.user?.uid ?? req.body.createdBy;
        const role = await roleService.addRole(req.params.companyId, req.params.clinicId, { ...req.body, createdBy: uid });
        res.status(201).json(role);
    }
    catch (err) {
        next(err);
    }
};
exports.addRole = addRole;
// Update role
const updateRole = async (req, res, next) => {
    try {
        const updated = await roleService.updateRole(req.params.companyId, req.params.clinicId, req.params.roleId, req.body);
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.updateRole = updateRole;
// Delete role
const deleteRole = async (req, res, next) => {
    try {
        await roleService.deleteRole(req.params.companyId, req.params.clinicId, req.params.roleId);
        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
};
exports.deleteRole = deleteRole;
