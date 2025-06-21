// src/api/roleApi.ts
import { API_BASE } from "../config/apiConfig";
import { Role } from "../types/sharedTypes";

/**
 * Fetch all roles for a given company and clinic
 */
export async function listRoles(
  token: string,
  companyId: string,
  clinicId: string
): Promise<Role[]> {
  const res = await fetch(
    `${API_BASE}/company/${companyId}/clinics/${clinicId}/roles`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch roles: ${res.status}`);
  }
  return res.json();
}

/**
 * Create a new role (staff-level) for company/clinic
 */
export async function createRole(
  token: string,
  companyId: string,
  clinicId: string,
  name: string
): Promise<Role> {
  const res = await fetch(
    `${API_BASE}/company/${companyId}/clinics/${clinicId}/roles`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Role creation failed: ${res.status} ${text}`);
  }
  return res.json();
}

/**
 * Rename an existing role (staff-level)
 */
export async function updateRole(
  token: string,
  companyId: string,
  clinicId: string,
  roleId: string,
  name: string
): Promise<Role> {
  const res = await fetch(
    `${API_BASE}/company/${companyId}/clinics/${clinicId}/roles/${encodeURIComponent(
      roleId
    )}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Role update failed: ${res.status} ${text}`);
  }
  return res.json();
}

/**
 * Delete a role by ID
 */
export async function deleteRole(
  token: string,
  companyId: string,
  clinicId: string,
  roleId: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/company/${companyId}/clinics/${clinicId}/roles/${encodeURIComponent(
      roleId
    )}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    throw new Error(`Role deletion failed: ${res.status}`);
  }
}
