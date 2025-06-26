import * as userRepo from "../dataAccess/userRepository";
import { getOrSetCache, invalidateCache } from "../utils/cacheHelpers";

export async function getUserProfile(uid: string) {
  const cacheKey = `user:profile:${uid}`;

  return getOrSetCache(cacheKey, () => userRepo.findByUid(uid));
}

export async function updateUserSettings(uid: string, updates: any) {
  const updated = await userRepo.updateSettings(uid, updates);
  await invalidateCache(`user:profile:${uid}`);
  return updated;
}

export async function deleteUser(uid: string) {
  const deleted = await userRepo.deleteUser(uid);
  await invalidateCache(`user:profile:${uid}`);
  await invalidateCache(`user:memberships:${uid}`);
  await invalidateCache(`user:clinics:${uid}`);
  return deleted;
}

export async function getUserMemberships(uid: string) {
  const cacheKey = `user:memberships:${uid}`;
  return getOrSetCache(cacheKey, () => userRepo.getUserMemberships(uid));
}

export async function getUserClinics(uid: string) {
  const cacheKey = `user:clinics:${uid}`;
  return getOrSetCache(cacheKey, () => userRepo.getUserClinics(uid));
}

// Registration — Invalidate caches
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
  const updated = await userRepo.addMembership(uid, membership);
  await invalidateCache(`user:memberships:${uid}`);
  await invalidateCache(`user:clinics:${uid}`);
  return updated;
}
