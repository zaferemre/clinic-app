"use strict";
// src/controllers/userController.ts
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
exports.getPushTokens = exports.setPushTokens = exports.removePushToken = exports.addPushToken = exports.listAllAppointmentsForMe = exports.addMembership = exports.listUserClinics = exports.listUserCompanies = exports.deleteUserAccount = exports.updateMe = exports.getMe = exports.registerUser = void 0;
const userService = __importStar(require("../services/userService"));
// POST /user/register
const registerUser = async (req, res, next) => {
    try {
        const uid = req.user.uid;
        const { email, name, photoUrl } = req.body;
        const user = await userService.registerUser(uid, { email, name, photoUrl });
        res.status(201).json(user);
    }
    catch (err) {
        next(err);
    }
};
exports.registerUser = registerUser;
// GET /user/me
const getMe = async (req, res, next) => {
    try {
        const uid = req.user.uid;
        const user = await userService.getUserProfile(uid);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(user);
    }
    catch (err) {
        next(err);
    }
};
exports.getMe = getMe;
// PATCH /user/me
const updateMe = async (req, res, next) => {
    try {
        const uid = req.user.uid;
        const user = await userService.updateUserSettings(uid, req.body);
        res.json(user);
    }
    catch (err) {
        next(err);
    }
};
exports.updateMe = updateMe;
// DELETE /user/me
const deleteUserAccount = async (req, res, next) => {
    try {
        const uid = req.user.uid;
        await userService.deleteUser(uid);
        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
};
exports.deleteUserAccount = deleteUserAccount;
// GET /user/companies
const listUserCompanies = async (req, res, next) => {
    try {
        const uid = req.user.uid;
        const companies = await userService.getUserMemberships(uid);
        res.json(companies);
    }
    catch (err) {
        next(err);
    }
};
exports.listUserCompanies = listUserCompanies;
// GET /user/clinics
const listUserClinics = async (req, res, next) => {
    try {
        const uid = req.user.uid;
        const clinics = await userService.getUserClinics(uid);
        res.json(clinics);
    }
    catch (err) {
        next(err);
    }
};
exports.listUserClinics = listUserClinics;
// POST /user/membership
const addMembership = async (req, res, next) => {
    try {
        const uid = req.user.uid;
        const { companyId, companyName, clinicId, clinicName, roles } = req.body;
        if (!companyId || !companyName) {
            res.status(400).json({ message: "companyId and companyName required" });
            return;
        }
        const membership = { companyId, companyName, clinicId, clinicName, roles };
        // Return FRESH memberships immediately after mutation!
        const memberships = await userService.addUserMembership(uid, membership);
        res.status(200).json(memberships);
    }
    catch (err) {
        next(err);
    }
};
exports.addMembership = addMembership;
// GET /user/appointments
const listAllAppointmentsForMe = async (req, res, next) => {
    try {
        const uid = req.user?.uid;
        if (!uid) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const appointments = await userService.getAllAppointmentsForUser(uid);
        res.json(appointments);
    }
    catch (err) {
        next(err);
    }
};
exports.listAllAppointmentsForMe = listAllAppointmentsForMe;
// --- PUSH TOKEN ENDPOINTLERİ ---
const addPushToken = async (req, res, next) => {
    try {
        const uid = req.params.uid || req.user?.uid;
        const { token } = req.body;
        if (!uid) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        if (!token) {
            res.status(400).json({ error: "Token is required" });
            return;
        }
        const user = await userService.addUserPushToken(uid, token);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json({ pushTokens: user.pushTokens });
    }
    catch (err) {
        next(err);
    }
};
exports.addPushToken = addPushToken;
const removePushToken = async (req, res, next) => {
    try {
        const uid = req.params.uid || req.user?.uid;
        const { token } = req.body;
        if (!uid) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        if (!token) {
            res.status(400).json({ error: "Token is required" });
            return;
        }
        const user = await userService.removeUserPushToken(uid, token);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json({ pushTokens: user.pushTokens });
    }
    catch (err) {
        next(err);
    }
};
exports.removePushToken = removePushToken;
const setPushTokens = async (req, res, next) => {
    try {
        const uid = req.params.uid || req.user?.uid;
        const { tokens } = req.body;
        if (!uid) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        if (!Array.isArray(tokens)) {
            res.status(400).json({ error: "Tokens must be array" });
            return;
        }
        const user = await userService.setUserPushTokens(uid, tokens);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json({ pushTokens: user.pushTokens });
    }
    catch (err) {
        next(err);
    }
};
exports.setPushTokens = setPushTokens;
const getPushTokens = async (req, res, next) => {
    try {
        const uid = req.params.uid || req.user?.uid;
        if (!uid) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const tokens = await userService.getUserPushTokens(uid);
        if (!tokens) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json({ pushTokens: tokens });
    }
    catch (err) {
        next(err);
    }
};
exports.getPushTokens = getPushTokens;
