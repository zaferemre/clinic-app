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
exports.getUserProfile = getUserProfile;
exports.updateUserSettings = updateUserSettings;
exports.deleteUser = deleteUser;
exports.getUserMemberships = getUserMemberships;
exports.getUserClinics = getUserClinics;
exports.registerUser = registerUser;
exports.addUserMembership = addUserMembership;
const userRepo = __importStar(require("../dataAccess/userRepository"));
const employeeRepo = __importStar(require("../dataAccess/employeeRepository"));
const mongoose_1 = require("mongoose");
// Get user profile directly from DB
async function getUserProfile(uid) {
    return userRepo.findByUid(uid);
}
// Update user settings (no cache)
async function updateUserSettings(uid, updates) {
    return userRepo.updateSettings(uid, updates);
}
// Delete user and all related data (no cache)
async function deleteUser(uid) {
    return userRepo.deleteUser(uid);
}
// Get user memberships directly from DB
async function getUserMemberships(uid) {
    return userRepo.getUserMemberships(uid);
}
// Get user clinics directly from DB
async function getUserClinics(uid) {
    return userRepo.getUserClinics(uid);
}
// Registration — no cache invalidation
async function registerUser(uid, data) {
    const { name } = data;
    if (!name)
        throw new Error("Name is required to register");
    return userRepo.upsertUser({
        uid,
        email: data.email,
        name,
        photoUrl: data.photoUrl,
    });
}
// Add membership, write-through to employeeRepo if clinic is present, no cache
async function addUserMembership(uid, membership) {
    await userRepo.addMembership(uid, membership);
    // If this is a clinic membership, also upsert as employee
    if (membership.clinicId) {
        await employeeRepo.createEmployee({
            userUid: uid,
            companyId: new mongoose_1.Types.ObjectId(membership.companyId),
            clinicId: new mongoose_1.Types.ObjectId(membership.clinicId),
            roles: membership.roles ?? [],
            isActive: true,
        });
    }
    // Return fresh memberships (straight from DB)
    return userRepo.getUserMemberships(uid);
}
