// src/dataAccess/userRepository.ts

import User, { UserDocument, Membership } from "../models/User";
import Employee from "../models/Employee";
import Appointment from "../models/Appointment";
import { Types } from "mongoose";

// Find user by Firebase UID
export async function findByUid(uid: string): Promise<UserDocument | null> {
  return User.findOne({ uid });
}

// Upsert user (create or update basic profile)
export async function upsertUser(user: {
  uid: string;
  email?: string;
  name: string;
  photoUrl?: string;
}): Promise<UserDocument> {
  return User.findOneAndUpdate(
    { uid: user.uid },
    {
      $setOnInsert: { createdAt: new Date() },
      $set: {
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl,
        updatedAt: new Date(),
      },
    },
    { new: true, upsert: true }
  ).exec();
}

// Update user settings
export async function updateSettings(uid: string, settings: any) {
  return User.findOneAndUpdate(
    { uid },
    { $set: settings, updatedAt: new Date() },
    { new: true }
  ).exec();
}

// Remove a membership and employee
export async function removeMembershipAndEmployee(
  uid: string,
  companyId: Types.ObjectId,
  clinicId?: Types.ObjectId
) {
  const pull: any = { companyId };
  if (clinicId) pull.clinicId = clinicId;

  // Remove membership
  const user = await User.findOneAndUpdate(
    { uid },
    { $pull: { memberships: pull }, $set: { updatedAt: new Date() } },
    { new: true }
  ).exec();

  // Remove Employee
  const filter: any = { companyId, userUid: uid };
  if (clinicId) filter.clinicId = clinicId;

  await Employee.deleteMany(filter);
  return user;
}

// Get all memberships
export async function getUserMemberships(uid: string) {
  const user = await User.findOne({ uid });
  return user?.memberships || [];
}

// Get all clinics user is a member of
export async function getUserClinics(uid: string) {
  const user = await User.findOne({ uid });
  return user?.memberships.filter((m) => m.clinicId) || [];
}

// Delete user and all related data
export async function deleteUser(uid: string) {
  const user = await User.findOne({ uid });
  if (!user) return null;

  await User.deleteOne({ uid });
  await Employee.deleteMany({ userUid: uid });
  await Appointment.deleteMany({
    $or: [{ patientId: uid }, { employeeId: uid }],
  });

  return true;
}

/**
 * Add membership, skipping duplicates. Always use Types.ObjectId for companyId/clinicId.
 * Only adds if company+clinic combo doesn't exist yet.
 */
export async function addMembership(
  uid: string,
  membership: {
    companyId: Types.ObjectId;
    companyName: string;
    clinicId?: Types.ObjectId;
    clinicName?: string;
    roles?: string[];
  }
) {
  // Only add if this combination does NOT exist
  const query: any = {
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
  const membershipObj: Membership = {
    companyId: membership.companyId,
    companyName: membership.companyName,
    ...(membership.clinicId && { clinicId: membership.clinicId }),
    ...(membership.clinicName && { clinicName: membership.clinicName }),
    roles: membership.roles ?? [],
  };

  return User.findOneAndUpdate(
    query,
    { $push: { memberships: membershipObj }, $set: { updatedAt: new Date() } },
    { new: true }
  ).exec();
}

/**
 * Bir kullanıcının tüm Employee kimliklerinden (farklı company/clinic’lerde olabilir) appointment'larını getirir.
 * @param uid Firebase UID
 * @returns Appointment[]
 */
export async function getAllAppointmentsForUser(uid: string) {
  // 1. Kullanıcının tüm Employee kimliklerini bul
  const employees = await Employee.find({ userUid: uid }, { _id: 1 }).lean();
  if (!employees.length) return [];
  const employeeIds = employees.map((e) => e._id);

  // 2. Tüm Appointment'ları getir
  return Appointment.find({ employeeId: { $in: employeeIds } }).lean();
}

// Push token ekle (duplicate varsa eklemez)
export async function addPushToken(
  uid: string,
  token: string
): Promise<UserDocument | null> {
  return User.findOneAndUpdate(
    { uid },
    { $addToSet: { pushTokens: token } },
    { new: true }
  );
}

// Push token kaldır
export async function removePushToken(
  uid: string,
  token: string
): Promise<UserDocument | null> {
  return User.findOneAndUpdate(
    { uid },
    { $pull: { pushTokens: token } },
    { new: true }
  );
}

// Tüm push tokenları güncelle (override)
export async function setPushTokens(
  uid: string,
  tokens: string[]
): Promise<UserDocument | null> {
  return User.findOneAndUpdate({ uid }, { pushTokens: tokens }, { new: true });
}

// Kullanıcıdan tüm push tokenları çek
export async function getPushTokens(uid: string): Promise<string[] | null> {
  const user = await User.findOne({ uid }).select("pushTokens");
  return user?.pushTokens ?? null;
}
