// src/api/employeeApi.ts
import { request } from "./apiClient";
import type { EmployeeInfo } from "../types/sharedTypes";

/**
 * List all employees for a specific clinic.
 */
export function listEmployees(
  token: string,
  companyId: string,
  clinicId: string
): Promise<EmployeeInfo[]> {
  return request<EmployeeInfo[]>(
    `/company/${companyId}/clinics/${clinicId}/employees`,
    { token }
  );
}

/**
 * Update an employee’s role or workingHours.
 */
export function updateEmployee(
  token: string,
  companyId: string,
  clinicId: string,
  employeeId: string,
  updates: Partial<Pick<EmployeeInfo, "role" | "workingHours">>
): Promise<EmployeeInfo> {
  return request<EmployeeInfo>(
    `/company/${companyId}/clinics/${clinicId}/employees/${employeeId}`,
    {
      method: "PATCH",
      token,
      body: updates,
    }
  );
}

/**
 * Remove (DELETE) an employee by their _id.
 */
export function removeEmployee(
  token: string,
  companyId: string,
  clinicId: string,
  employeeId: string
): Promise<void> {
  return request(
    `/company/${companyId}/clinics/${clinicId}/employees/${employeeId}`,
    {
      method: "DELETE",
      token,
    }
  );
}
