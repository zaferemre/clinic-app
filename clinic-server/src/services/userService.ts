// src/services/userService.ts

import * as userRepo from "../dataAccess/userRepository";
import * as employeeRepo from "../dataAccess/employeeRepository";
import { Types } from "mongoose";
import { getOrSetCache } from "../utils/cacheHelpers";

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

/**
 * Bir kullanıcının tüm Employee ID'lerinden appointmentlarını getirir.
 * @param uid
 * @returns Appointment[]
 * Bu fonksiyonda cache kullanıyoruz.
 */
export async function getAllAppointmentsForUser(uid: string) {
  const cacheKey = `user:${uid}:allAppointments`;
  return getOrSetCache(cacheKey, () => userRepo.getAllAppointmentsForUser(uid));
}

// Push token ekle
export async function addUserPushToken(uid: string, token: string) {
  return userRepo.addPushToken(uid, token);
}

// Push token kaldır
export async function removeUserPushToken(uid: string, token: string) {
  return userRepo.removePushToken(uid, token);
}

// Tüm tokenları güncelle
export async function setUserPushTokens(uid: string, tokens: string[]) {
  return userRepo.setPushTokens(uid, tokens);
}

// Tokenları getir
export async function getUserPushTokens(uid: string) {
  return userRepo.getPushTokens(uid);
}
