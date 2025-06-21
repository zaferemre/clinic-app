// src/utils/roles.ts
export function isElevatedRole(role: string) {
  return role === "owner" || role === "admin";
}
