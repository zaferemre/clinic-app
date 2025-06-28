"use strict";
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
const mongoose_1 = require("mongoose");
const Appointment_1 = __importDefault(require("../models/Appointment"));
const Employee_1 = __importDefault(require("../models/Employee"));
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
/**
 * Remove a membership from a user and delete their corresponding employee record.
 * @param uid - The user UID
 * @param companyId - The company ID
 * @param clinicId - The clinic ID (optional)
 */
async function removeMembershipAndEmployee(uid, companyId, clinicId) {
    // Remove the membership from the user document
    const pull = { companyId: companyId.toString() };
    if (clinicId && clinicId.length > 0)
        pull.clinicId = clinicId;
    const user = await User_1.default.findOneAndUpdate({ uid }, { $pull: { memberships: pull }, $set: { updatedAt: new Date() } }, { new: true }).exec();
    // Remove the corresponding Employee record
    const employeeFilter = {
        companyId: new mongoose_1.Types.ObjectId(companyId),
        userUid: uid,
    };
    if (clinicId && clinicId.length > 0) {
        employeeFilter.clinicId = new mongoose_1.Types.ObjectId(clinicId);
    }
    await Employee_1.default.deleteMany(employeeFilter);
    return user;
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
    // 1. Find user (get _id and other info)
    const user = await User_1.default.findOne({ uid });
    if (!user)
        return null;
    // 2. Delete user document
    await User_1.default.deleteOne({ uid });
    // 3. Delete all employee records for user
    await Employee_1.default.deleteMany({ userUid: uid });
    // 4. Delete all appointments where user is patient or assigned employee
    await Appointment_1.default.deleteMany({
        $or: [
            { patientId: uid },
            { employeeId: uid }, // or whatever your field is
        ],
    });
    return true;
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
