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
const cacheHelpers_1 = require("../utils/cacheHelpers");
const employeeRepo = __importStar(require("../dataAccess/employeeRepository"));
const mongoose_1 = require("mongoose");
// Get cached user profile
async function getUserProfile(uid) {
    const cacheKey = `user:profile:${uid}`;
    return (0, cacheHelpers_1.getOrSetCache)(cacheKey, () => userRepo.findByUid(uid));
}
// Update user settings, invalidate profile cache
async function updateUserSettings(uid, updates) {
    const updated = await userRepo.updateSettings(uid, updates);
    await (0, cacheHelpers_1.invalidateCache)(`user:profile:${uid}`);
    return updated;
}
// Delete user, invalidate all caches
async function deleteUser(uid) {
    const deleted = await userRepo.deleteUser(uid);
    await (0, cacheHelpers_1.invalidateCache)(`user:profile:${uid}`);
    await (0, cacheHelpers_1.invalidateCache)(`user:memberships:${uid}`);
    await (0, cacheHelpers_1.invalidateCache)(`user:clinics:${uid}`);
    return deleted;
}
// Get cached user memberships
async function getUserMemberships(uid) {
    const cacheKey = `user:memberships:${uid}`;
    return (0, cacheHelpers_1.getOrSetCache)(cacheKey, () => userRepo.getUserMemberships(uid));
}
// Get cached user clinics
async function getUserClinics(uid) {
    const cacheKey = `user:clinics:${uid}`;
    return (0, cacheHelpers_1.getOrSetCache)(cacheKey, () => userRepo.getUserClinics(uid));
}
// Registration — Invalidate all relevant caches
async function registerUser(uid, data) {
    const { name } = data;
    if (!name)
        throw new Error("Name is required to register");
    const result = await userRepo.upsertUser({
        uid,
        email: data.email,
        name,
        photoUrl: data.photoUrl,
    });
    await (0, cacheHelpers_1.invalidateCache)(`user:profile:${uid}`);
    await (0, cacheHelpers_1.invalidateCache)(`user:memberships:${uid}`);
    await (0, cacheHelpers_1.invalidateCache)(`user:clinics:${uid}`);
    return result;
}
// Add user membership (join company/clinic), immediately update cache!
async function addUserMembership(uid, membership) {
    const updated = await userRepo.addMembership(uid, membership);
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
    // Invalidate old cache keys
    await (0, cacheHelpers_1.invalidateCache)(`user:memberships:${uid}`);
    await (0, cacheHelpers_1.invalidateCache)(`user:clinics:${uid}`);
    // Write-through: set fresh cache immediately!
    const freshMemberships = await userRepo.getUserMemberships(uid);
    await (0, cacheHelpers_1.setCache)(`user:memberships:${uid}`, freshMemberships);
    const freshClinics = await userRepo.getUserClinics(uid);
    await (0, cacheHelpers_1.setCache)(`user:clinics:${uid}`, freshClinics);
    // Return fresh memberships (or both if you want)
    return freshMemberships;
}
