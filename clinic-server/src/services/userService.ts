import * as userRepo from "../dataAccess/userRepository";
import {
  getOrSetCache,
  invalidateCache,
  setCache,
} from "../utils/cacheHelpers";
import * as employeeRepo from "../dataAccess/employeeRepository";
import { Types } from "mongoose";

// Get cached user profile
export async function getUserProfile(uid: string) {
  const cacheKey = `user:profile:${uid}`;
  return getOrSetCache(cacheKey, () => userRepo.findByUid(uid));
}

// Update user settings, invalidate profile cache
export async function updateUserSettings(uid: string, updates: any) {
  const updated = await userRepo.updateSettings(uid, updates);
  await invalidateCache(`user:profile:${uid}`);
  return updated;
}

// Delete user and all related data, invalidate all caches
export async function deleteUser(uid: string) {
  await userRepo.deleteUser(uid);
  await invalidateCache(`user:profile:${uid}`);
  await invalidateCache(`user:memberships:${uid}`);
  await invalidateCache(`user:clinics:${uid}`);
  return true;
}

// Get cached user memberships
export async function getUserMemberships(uid: string) {
  const cacheKey = `user:memberships:${uid}`;
  return getOrSetCache(cacheKey, () => userRepo.getUserMemberships(uid));
}

// Get cached user clinics
export async function getUserClinics(uid: string) {
  const cacheKey = `user:clinics:${uid}`;
  return getOrSetCache(cacheKey, () => userRepo.getUserClinics(uid));
}

// Registration — Invalidate all relevant caches
export async function registerUser(
  uid: string,
  data: { email?: string; name?: string; photoUrl?: string }
) {
  const { name } = data;
  if (!name) throw new Error("Name is required to register");
  const result = await userRepo.upsertUser({
    uid,
    email: data.email,
    name,
    photoUrl: data.photoUrl,
  });
  await invalidateCache(`user:profile:${uid}`);
  await invalidateCache(`user:memberships:${uid}`);
  await invalidateCache(`user:clinics:${uid}`);
  return result;
}
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

  // Invalidate all caches
  await invalidateCache(`user:profile:${uid}`);
  await invalidateCache(`user:memberships:${uid}`);
  await invalidateCache(`user:clinics:${uid}`);

  // Refresh and set all caches with fresh data (write-through!)
  const freshMemberships = await userRepo.getUserMemberships(uid);
  await setCache(`user:memberships:${uid}`, freshMemberships);

  const freshClinics = await userRepo.getUserClinics(uid);
  await setCache(`user:clinics:${uid}`, freshClinics);

  // THE CRITICAL FIX: Write the up-to-date user profile to cache!
  const freshUser = await userRepo.findByUid(uid);
  await setCache(`user:profile:${uid}`, freshUser);

  // Return fresh memberships (or freshUser if you want)
  return freshMemberships;
}
