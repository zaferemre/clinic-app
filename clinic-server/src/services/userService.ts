import * as userRepo from "../dataAccess/userRepository";
import * as employeeRepo from "../dataAccess/employeeRepository";
import { Types } from "mongoose";

// User profile direct from DB
export async function getUserProfile(uid: string) {
  return userRepo.findByUid(uid);
}

export async function updateUserSettings(uid: string, updates: any) {
  return userRepo.updateSettings(uid, updates);
}

export async function deleteUser(uid: string) {
  return userRepo.deleteUser(uid);
}

export async function getUserMemberships(uid: string) {
  return userRepo.getUserMemberships(uid);
}

export async function getUserClinics(uid: string) {
  return userRepo.getUserClinics(uid);
}

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

// Add membership and create employee if clinicId is present
export async function addUserMembership(
  uid: string,
  membership: {
    companyId: Types.ObjectId;
    companyName: string;
    clinicId?: Types.ObjectId;
    clinicName?: string;
    roles?: string[];
  }
) {
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
