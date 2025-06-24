"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findByUid = findByUid;
exports.upsertUser = upsertUser;
exports.updateSettings = updateSettings;
exports.removeMembership = removeMembership;
exports.getUserMemberships = getUserMemberships;
exports.getUserClinics = getUserClinics;
exports.deleteUser = deleteUser;
exports.addMembership = addMembership;
const User_1 = __importDefault(require("../models/User"));
async function findByUid(uid) {
    return User_1.default.findOne({ uid });
}
async function upsertUser(user) {
    // create if missing, otherwise update name/email/photo
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
async function updateSettings(uid, settings) {
    return User_1.default.findOneAndUpdate({ uid }, { $set: settings, updatedAt: new Date() }, { new: true }).exec();
}
async function removeMembership(uid, companyId, clinicId) {
    return User_1.default.findOneAndUpdate({ uid }, { $pull: { memberships: { companyId, clinicId } } }, { new: true }).exec();
}
async function getUserMemberships(uid) {
    const user = await User_1.default.findOne({ uid });
    return user?.memberships || [];
}
async function getUserClinics(uid) {
    const user = await User_1.default.findOne({ uid });
    // flatten memberships with clinicId present:
    return user?.memberships.filter((m) => m.clinicId) || [];
}
async function deleteUser(uid) {
    return User_1.default.findOneAndDelete({ uid }).exec();
}
async function addMembership(uid, membership) {
    // Only add if that exact companyId + clinicId is not present
    const query = { uid };
    if (membership.clinicId) {
        query["memberships"] = {
            $not: {
                $elemMatch: {
                    companyId: membership.companyId,
                    clinicId: membership.clinicId,
                },
            },
        };
    }
    else {
        query["memberships"] = {
            $not: {
                $elemMatch: {
                    companyId: membership.companyId,
                    clinicId: { $exists: false },
                },
            },
        };
    }
    return User_1.default.findOneAndUpdate(query, { $push: { memberships: membership }, $set: { updatedAt: new Date() } }, { new: true }).exec();
}
