"use strict";
// src/dataAccess/userRepository.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findByUid = findByUid;
exports.upsertUser = upsertUser;
exports.updateSettings = updateSettings;
exports.removeMembershipAndEmployee = removeMembershipAndEmployee;
exports.getUserMemberships = getUserMemberships;
exports.getUserClinics = getUserClinics;
exports.deleteUser = deleteUser;
exports.addMembership = addMembership;
exports.getAllAppointmentsForUser = getAllAppointmentsForUser;
exports.addPushToken = addPushToken;
exports.removePushToken = removePushToken;
exports.setPushTokens = setPushTokens;
exports.getPushTokens = getPushTokens;
const User_1 = __importDefault(require("../models/User"));
const Employee_1 = __importDefault(require("../models/Employee"));
const Appointment_1 = __importDefault(require("../models/Appointment"));
// Find user by Firebase UID
async function findByUid(uid) {
    return User_1.default.findOne({ uid });
}
// Upsert user (create or update basic profile)
async function upsertUser(user) {
    return User_1.default.findOneAndUpdate({ uid: user.uid }, {
        $setOnInsert: { createdAt: new Date() },
        $set: {
            email: user.email,
            name: user.name,
            photoUrl: user.photoUrl,
            updatedAt: new Date(),
        },
    }, { new: true, upsert: true }).exec();
}
// Update user settings
async function updateSettings(uid, settings) {
    return User_1.default.findOneAndUpdate({ uid }, { $set: settings, updatedAt: new Date() }, { new: true }).exec();
}
// Remove a membership and employee
async function removeMembershipAndEmployee(uid, companyId, clinicId) {
    const pull = { companyId };
    if (clinicId)
        pull.clinicId = clinicId;
    // Remove membership
    const user = await User_1.default.findOneAndUpdate({ uid }, { $pull: { memberships: pull }, $set: { updatedAt: new Date() } }, { new: true }).exec();
    // Remove Employee
    const filter = { companyId, userUid: uid };
    if (clinicId)
        filter.clinicId = clinicId;
    await Employee_1.default.deleteMany(filter);
    return user;
}
// Get all memberships
async function getUserMemberships(uid) {
    const user = await User_1.default.findOne({ uid });
    return user?.memberships || [];
}
// Get all clinics user is a member of
async function getUserClinics(uid) {
    const user = await User_1.default.findOne({ uid });
    return user?.memberships.filter((m) => m.clinicId) || [];
}
// Delete user and all related data
async function deleteUser(uid) {
    const user = await User_1.default.findOne({ uid });
    if (!user)
        return null;
    await User_1.default.deleteOne({ uid });
    await Employee_1.default.deleteMany({ userUid: uid });
    await Appointment_1.default.deleteMany({
        $or: [{ patientId: uid }, { employeeId: uid }],
    });
    return true;
}
/**
 * Add membership, skipping duplicates. Always use Types.ObjectId for companyId/clinicId.
 * Only adds if company+clinic combo doesn't exist yet.
 */
async function addMembership(uid, membership) {
    // Only add if this combination does NOT exist
    const query = {
        uid,
        memberships: {
            $not: {
                $elemMatch: {
                    companyId: membership.companyId,
                    ...(membership.clinicId
                        ? { clinicId: membership.clinicId }
                        : { clinicId: { $exists: false } }),
                },
            },
        },
    };
    // Construct the membership object to add
    const membershipObj = {
        companyId: membership.companyId,
        companyName: membership.companyName,
        ...(membership.clinicId && { clinicId: membership.clinicId }),
        ...(membership.clinicName && { clinicName: membership.clinicName }),
        roles: membership.roles ?? [],
    };
    return User_1.default.findOneAndUpdate(query, { $push: { memberships: membershipObj }, $set: { updatedAt: new Date() } }, { new: true }).exec();
}
/**
 * Bir kullanıcının tüm Employee kimliklerinden (farklı company/clinic’lerde olabilir) appointment'larını getirir.
 * @param uid Firebase UID
 * @returns Appointment[]
 */
async function getAllAppointmentsForUser(uid) {
    // 1. Kullanıcının tüm Employee kimliklerini bul
    const employees = await Employee_1.default.find({ userUid: uid }, { _id: 1 }).lean();
    if (!employees.length)
        return [];
    const employeeIds = employees.map((e) => e._id);
    // 2. Tüm Appointment'ları getir
    return Appointment_1.default.find({ employeeId: { $in: employeeIds } }).lean();
}
// Push token ekle (duplicate varsa eklemez)
async function addPushToken(uid, token) {
    return User_1.default.findOneAndUpdate({ uid }, { $addToSet: { pushTokens: token } }, { new: true });
}
// Push token kaldır
async function removePushToken(uid, token) {
    return User_1.default.findOneAndUpdate({ uid }, { $pull: { pushTokens: token } }, { new: true });
}
// Tüm push tokenları güncelle (override)
async function setPushTokens(uid, tokens) {
    return User_1.default.findOneAndUpdate({ uid }, { pushTokens: tokens }, { new: true });
}
// Kullanıcıdan tüm push tokenları çek
async function getPushTokens(uid) {
    const user = await User_1.default.findOne({ uid }).select("pushTokens");
    return user?.pushTokens ?? null;
}
