"use strict";
// src/services/userService.ts
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
exports.getAllAppointmentsForUser = getAllAppointmentsForUser;
exports.addUserPushToken = addUserPushToken;
exports.removeUserPushToken = removeUserPushToken;
exports.setUserPushTokens = setUserPushTokens;
exports.getUserPushTokens = getUserPushTokens;
const userRepo = __importStar(require("../dataAccess/userRepository"));
const employeeRepo = __importStar(require("../dataAccess/employeeRepository"));
const cacheHelpers_1 = require("../utils/cacheHelpers");
// User profile direct from DB
async function getUserProfile(uid) {
    return userRepo.findByUid(uid);
}
async function updateUserSettings(uid, updates) {
    return userRepo.updateSettings(uid, updates);
}
async function deleteUser(uid) {
    return userRepo.deleteUser(uid);
}
async function getUserMemberships(uid) {
    return userRepo.getUserMemberships(uid);
}
async function getUserClinics(uid) {
    return userRepo.getUserClinics(uid);
}
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
// Add membership and create employee if clinicId is present
async function addUserMembership(uid, membership) {
    // Add membership (deduplication is handled at repo level)
    await userRepo.addMembership(uid, membership);
    // If a clinic membership, create the Employee (upsert style)
    if (membership.clinicId) {
        await employeeRepo.createEmployee({
            userUid: uid,
            companyId: membership.companyId,
            clinicId: membership.clinicId,
            roles: membership.roles ?? [],
            isActive: true,
            services: [],
            workingHours: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
    // Return fresh memberships
    return userRepo.getUserMemberships(uid);
}
/**
 * Bir kullanıcının tüm Employee ID'lerinden appointmentlarını getirir.
 * @param uid
 * @returns Appointment[]
 * Bu fonksiyonda cache kullanıyoruz.
 */
async function getAllAppointmentsForUser(uid) {
    const cacheKey = `user:${uid}:allAppointments`;
    return (0, cacheHelpers_1.getOrSetCache)(cacheKey, () => userRepo.getAllAppointmentsForUser(uid));
}
// Push token ekle
async function addUserPushToken(uid, token) {
    return userRepo.addPushToken(uid, token);
}
// Push token kaldır
async function removeUserPushToken(uid, token) {
    return userRepo.removePushToken(uid, token);
}
// Tüm tokenları güncelle
async function setUserPushTokens(uid, tokens) {
    return userRepo.setPushTokens(uid, tokens);
}
// Tokenları getir
async function getUserPushTokens(uid) {
    return userRepo.getPushTokens(uid);
}
