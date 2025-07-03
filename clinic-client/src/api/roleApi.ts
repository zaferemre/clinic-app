import { request } from "./apiClient";
import { Role } from "../types/sharedTypes";

/**
 * Fetch all roles for a given company and clinic
 */
export function listRoles(
  token: string,
  companyId: string,
  clinicId: string
): Promise<Role[]> {
  return request<Role[]>(`/company/${companyId}/clinics/${clinicId}/roles`, {
    token,
  });
}

/**
 * Create a new role for company/clinic
 */
export function createRole(
  token: string,
  companyId: string,
  clinicId: string,
  name: string
): Promise<Role> {
  return request<Role>(`/company/${companyId}/clinics/${clinicId}/roles`, {
    method: "POST",
    token,
    body: { name },
  });
}

/**
 * Rename an existing role
 */
export function updateRole(
  token: string,
  companyId: string,
  clinicId: string,
  roleId: string,
  name: string
): Promise<Role> {
  return request<Role>(
    `/company/${companyId}/clinics/${clinicId}/roles/${encodeURIComponent(
      roleId
    )}`,
    {
      method: "PATCH",
      token,
      body: { name },
    }
  );
}

/**
 * Delete a role by ID
 */
export function deleteRole(
  token: string,
  companyId: string,
  clinicId: string,
  roleId: string
): Promise<void> {
  return request(
    `/company/${companyId}/clinics/${clinicId}/roles/${encodeURIComponent(
      roleId
    )}`,
    {
      method: "DELETE",
      token,
    }
  );
}
