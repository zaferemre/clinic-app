import * as userRepo from "../dataAccess/userRepository";
import * as employeeRepo from "../dataAccess/employeeRepository";
import { Types } from "mongoose";

// Get user profile directly from DB
export async function getUserProfile(uid: string) {
  return userRepo.findByUid(uid);
}

// Update user settings (no cache)
export async function updateUserSettings(uid: string, updates: any) {
  return userRepo.updateSettings(uid, updates);
}

// Delete user and all related data (no cache)
export async function deleteUser(uid: string) {
  return userRepo.deleteUser(uid);
}

// Get user memberships directly from DB
export async function getUserMemberships(uid: string) {
  return userRepo.getUserMemberships(uid);
}

// Get user clinics directly from DB
export async function getUserClinics(uid: string) {
  return userRepo.getUserClinics(uid);
}

// Registration — no cache invalidation
export async function registerUser(
  uid: string,
  data: { email?: string; name?: string; photoUrl?: string }
) {
  const { name } = data;
  if (!name) throw new Error("Name is required to register");
  return userRepo.upsertUser({
    uid,
    email: data.email,
    name,
    photoUrl: data.photoUrl,
  });
}

// Add membership, write-through to employeeRepo if clinic is present, no cache
export async function addUserMembership(
  uid: string,
  membership: {
    companyId: string;
    companyName: string;
    clinicId?: string;
    clinicName?: string;
    roles?: string[];
  }
) {
  await userRepo.addMembership(uid, membership);

  // If this is a clinic membership, also upsert as employee
  if (membership.clinicId) {
    await employeeRepo.createEmployee({
      userUid: uid,
      companyId: new Types.ObjectId(membership.companyId),
      clinicId: new Types.ObjectId(membership.clinicId),
      roles: membership.roles ?? [],
      isActive: true,
    });
  }

  // Return fresh memberships (straight from DB)
  return userRepo.getUserMemberships(uid);
}
