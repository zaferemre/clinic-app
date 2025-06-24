// src/api/userApi.ts
import { User, UserMembership } from "../types/sharedTypes";
import { request } from "./apiClient";

/**
 * Fetch the current authenticated user's full profile.
 * GET /user/me
 */
export function getCurrentUser(token: string): Promise<User> {
  return request<User>("/user/me", { token });
}

/**
 * Create a new user record in the backend.
 * POST /user
 */
export function createUser(
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
  return request("/user/me", {
    method: "DELETE",
    token,
  });
}

/**
 * List all company memberships for this user.
 * GET /user/me/memberships
 */
export function getUserMemberships(token: string): Promise<UserMembership[]> {
  return request<UserMembership[]>("/user/me/memberships", { token });
}

export async function addMembership(
  token: string,
  data: {
    companyId: string;
    companyName: string;
    clinicId: string;
    clinicName: string;
    roles?: string[];
  }
) {
  // Assumes your backend expects this
  return fetch("/user/membership", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  }).then((res) => {
    if (!res.ok) throw new Error("Membership eklenemedi");
    return res.json();
  });
}
