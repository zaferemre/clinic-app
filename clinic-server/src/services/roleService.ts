import * as repo from "../dataAccess/roleRepository";

export function listRoles(companyId: string) {
  return repo.listRoles(companyId);
}

export function addRole(companyId: string, role: string) {
  return repo.addRole(companyId, role);
}

export function updateRole(
  companyId: string,
  oldRole: string,
  newRole: string
) {
  return repo.updateRole(companyId, oldRole, newRole);
}

export function deleteRole(companyId: string, role: string) {
  return repo.deleteRole(companyId, role);
}
