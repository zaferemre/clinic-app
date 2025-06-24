// src/utils/userRole.ts

import type { User } from "../types/sharedTypes";

// Priority: owner > admin > staff > (anything else)
const rolePriority = ["owner", "admin", "staff"];

export function getUserRolesForContext(
  user: User | null,
  companyId: string | null,
  clinicId?: string | null
): string[] {
  if (!user || !companyId) return [];
  return user.memberships
    .filter(
      (m) => m.companyId === companyId && (!clinicId || m.clinicId === clinicId)
    )
    .flatMap((m) => m.roles || []);
}

export function getPrimaryRole(
  user: User | null,
  companyId: string | null,
  clinicId?: string | null
): string | undefined {
  const roles = getUserRolesForContext(user, companyId, clinicId);
  for (const p of rolePriority) {
    if (roles.includes(p)) return p;
  }
  return roles[0];
}

export function isElevatedRole(role?: string) {
  return role === "owner" || role === "admin";
}
