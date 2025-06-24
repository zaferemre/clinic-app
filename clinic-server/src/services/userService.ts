import * as userRepo from "../dataAccess/userRepository";

export async function getUserProfile(uid: string) {
  const user = await userRepo.findByUid(uid);
  if (!user) throw new Error("User not found");
  return user;
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
  // implement similar to memberships
  return userRepo.getUserClinics(uid);
}

// New registration service
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
  return userRepo.addMembership(uid, membership);
}
