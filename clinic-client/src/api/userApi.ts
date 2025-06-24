// src/api/userApi.ts
import { request } from "./apiClient";
import {
  User,
  UserMembership,
  Company,
  Clinic,
  Appointment,
} from "../types/sharedTypes";

/**
 * Fetch the current authenticated user's full profile.
 * GET /user/me
 */
export function getCurrentUser(token: string): Promise<User> {
  return request<User>("/user/me", { token });
}

/**
 * Register a new user record in the backend.
 * POST /user/register
 */
export function registerUser(
  token: string,
  data: {
    name: string;
    email: string;
    photoUrl?: string;
    phoneNumber?: string;
  }
): Promise<User> {
  return request<User>("/user/register", {
    method: "POST",
    token,
    body: data,
  });
}

/**
 * Update current user's profile.
 * PATCH /user/me
 */
export function updateUserProfile(
  token: string,
  updates: Partial<
    Pick<User, "name" | "preferences" | "phoneNumber" | "photoUrl">
  >
): Promise<User> {
  return request<User>("/user/me", {
    method: "PATCH",
    token,
    body: updates,
  });
}

/**
 * Delete the current user's account.
 * DELETE /user/me
 */
export function deleteUser(token: string): Promise<void> {
  return request<void>("/user/me", {
    method: "DELETE",
    token,
  });
}

/**
 * List all company & clinic memberships for this user.
 * GET /user/me/companies
 */
export function getUserCompanies(token: string): Promise<Company[]> {
  return request<Company[]>("/user/me/companies", { token });
}

/**
 * List all clinics this user belongs to.
 * GET /user/me/clinics
 */
export function getUserClinics(token: string): Promise<Clinic[]> {
  return request<Clinic[]>("/user/me/clinics", { token });
}

/**
 * List all raw membership objects for this user.
 * GET /user/me/memberships
 */
export function getUserMemberships(token: string): Promise<UserMembership[]> {
  return request<UserMembership[]>("/user/me/memberships", { token });
}

/**
 * Add a new membership for the current user.
 * POST /user/membership
 */
export function addMembership(
  token: string,
  data: {
    companyId: string;
    companyName: string;
    clinicId?: string;
    clinicName?: string;
    roles?: string[];
  }
): Promise<UserMembership> {
  return request<UserMembership>("/user/membership", {
    method: "POST",
    token,
    body: data,
  });
}

/**
 * List all appointments for the current user.
 * GET /user/appointments
 */
export function listUserAppointments(token: string): Promise<Appointment[]> {
  return request<Appointment[]>("/user/appointments", { token });
}
