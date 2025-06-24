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
async function getUserProfile(uid) {
    const user = await userRepo.findByUid(uid);
    if (!user)
        throw new Error("User not found");
    return user;
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
    // implement similar to memberships
    return userRepo.getUserClinics(uid);
}
// New registration service
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
async function addUserMembership(uid, membership) {
    return userRepo.addMembership(uid, membership);
}
