import { request } from "./apiClient";

/**
 * Fetch the list of dynamic roles for a company.
 */
export function getRoles(token: string, companyId: string): Promise<string[]> {
  return request<string[]>(`/company/${companyId}/roles`, { token });
}

/**
 * Create a new role in the company.
 */
export function createRole(
  token: string,
  companyId: string,
  role: string
): Promise<string[]> {
  return request<string[]>(`/company/${companyId}/roles`, {
    method: "POST",
    token,
    body: { role },
  });
}

/**
 * Update an existing role name.
 */
export function updateRole(
  token: string,
  companyId: string,
  oldRole: string,
  newRole: string
): Promise<string[]> {
  return request<string[]>(`/company/${companyId}/roles`, {
    method: "PATCH",
    token,
    body: { oldRole, newRole },
  });
}

/**
 * Remove a role from the company (and reassign employees to "staff").
 */
export function removeRole(
  token: string,
  companyId: string,
  role: string
): Promise<string[]> {
  return request<string[]>(
    `/company/${companyId}/roles/${encodeURIComponent(role)}`,
    { method: "DELETE", token }
  );
}
