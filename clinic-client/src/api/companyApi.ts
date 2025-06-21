// src/api/companyApi.ts
import {
  Company,
  EmployeeInfo,
  WorkingHour,
  ServiceInfo,
} from "../types/sharedTypes";
import { request } from "./apiClient";

export interface JoinCompanyByCodeResponse {
  companyId: string;
  companyName: string;
  clinics: { _id: string; name: string }[];
  ownerName: string;
}

/**
 * Fetch all companies this user belongs to.
 */
export function getCompanies(token: string): Promise<Company[]> {
  return request<Company[]>("/company", { token });
}

/**
 * Fetch a single company by its ID.
 */
export function getCompanyById(
  token: string,
  companyId: string
): Promise<Company> {
  return request<Company>(`/company/${companyId}`, { token });
}

export interface CreateCompanyPayload {
  name: string;
  websiteUrl?: string;
  socialLinks?: {
    instagram: string;
    facebook: string;
    whatsapp: string;
  };
  settings: {
    allowPublicBooking: boolean;
    inactivityThresholdDays: number;
  };
}

/**
 * Create a new company (POST /company).
 */
export function createCompany(
  token: string,
  payload: CreateCompanyPayload
): Promise<Company> {
  return request<Company>("/company", {
    method: "POST",
    token,
    body: payload,
  });
}

/**
 * Update an existing company (PATCH /company/:companyId).
 */
export function updateCompany(
  token: string,
  companyId: string,
  updates: Partial<
    Omit<Company, "_id" | "ownerEmail" | "ownerName" | "clinics">
  >
): Promise<Company> {
  return request<Company>(`/company/${companyId}`, {
    method: "PATCH",
    token,
    body: updates,
  });
}

/**
 * Delete a company (DELETE /company/:companyId).
 */
export function deleteCompany(token: string, companyId: string): Promise<void> {
  return request(`/company/${companyId}`, {
    method: "DELETE",
    token,
  });
}

/**
 * List all employees for a company (GET /company/:companyId/employees).
 */
export function listEmployees(
  token: string,
  companyId: string
): Promise<EmployeeInfo[]> {
  return request<EmployeeInfo[]>(`/company/${companyId}/employees`, { token });
}

/**
 * Add a new employee (POST /company/:companyId/employees).
 */
export function addEmployee(
  token: string,
  companyId: string,
  payload: Omit<EmployeeInfo, "_id">
): Promise<EmployeeInfo> {
  return request<EmployeeInfo>(`/company/${companyId}/employees`, {
    method: "POST",
    token,
    body: payload,
  });
}

/**
 * Update an employee (PATCH /company/:companyId/employees/:employeeId).
 */
export function updateEmployee(
  token: string,
  companyId: string,
  employeeId: string,
  updates: Partial<Pick<EmployeeInfo, "role" | "workingHours">>
): Promise<EmployeeInfo> {
  return request<EmployeeInfo>(
    `/company/${companyId}/employees/${employeeId}`,
    {
      method: "PATCH",
      token,
      body: updates,
    }
  );
}

/**
 * Remove an employee (DELETE /company/:companyId/employees/:employeeId).
 */
export function removeEmployee(
  token: string,
  companyId: string,
  employeeId: string
): Promise<void> {
  return request(`/company/${companyId}/employees/${employeeId}`, {
    method: "DELETE",
    token,
  });
}

/**
 * Leave a company (POST /company/:companyId/leave).
 */
export function leaveCompany(token: string, companyId: string): Promise<void> {
  return request(`/company/${companyId}/leave`, {
    method: "POST",
    token,
  });
}

/**
 * Update working hours (PATCH /company/:companyId/working-hours).
 */
export function updateWorkingHours(
  token: string,
  companyId: string,
  workingHours: WorkingHour[]
): Promise<WorkingHour[]> {
  return request<WorkingHour[]>(`/company/${companyId}/working-hours`, {
    method: "PATCH",
    token,
    body: { workingHours },
  });
}

/**
 * Update services (PATCH /company/:companyId/services).
 */
export function updateServices(
  token: string,
  companyId: string,
  services: ServiceInfo[]
): Promise<ServiceInfo[]> {
  return request<ServiceInfo[]>(`/company/${companyId}/services`, {
    method: "PATCH",
    token,
    body: { services },
  });
}

/**
 * Fetch services (GET /company/:companyId/services).
 */
export function getServices(
  token: string,
  companyId: string
): Promise<ServiceInfo[]> {
  return request<ServiceInfo[]>(`/company/${companyId}/services`, { token });
}

/**
 * Delete the current user account (DELETE /company/user).
 */
export function deleteUser(token: string): Promise<void> {
  return request("/company/user", {
    method: "DELETE",
    token,
  });
}

/**
 * Join a company by join code (POST /company/join).
 * Returns { success, companyId, companyName } on success.
 */
// Update the API function:
export function joinCompanyByCode(
  token: string,
  joinCode: string
): Promise<JoinCompanyByCodeResponse> {
  return request<JoinCompanyByCodeResponse>("/company/join", {
    method: "POST",
    token,
    body: { joinCode },
  });
}

export async function joinClinic(
  token: string,
  companyId: string,
  clinicId: string
) {
  return request(`/company/${companyId}/clinics/${clinicId}/join`, {
    method: "POST",
    token,
  });
}
