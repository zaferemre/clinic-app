import {
  Company,
  EmployeeInfo,
  WorkingHour,
  ServiceInfo,
} from "../types/sharedTypes";
import { request } from "./apiClient";

export function getCompanyByEmail(token: string): Promise<Company> {
  return request<Company>("/company", { token });
}
export function getCompanyById(
  token: string,
  companyId: string
): Promise<Company> {
  return request<Company>(`/company/${companyId}`, { token });
}

export function createCompany(
  token: string,
  payload: Omit<Company, "_id" | "ownerEmail" | "ownerName">
): Promise<Company> {
  return request<Company>("/company", { method: "POST", token, body: payload });
}

export function updateCompany(
  token: string,
  companyId: string,
  updates: Partial<Omit<Company, "_id" | "ownerEmail" | "ownerName">>
): Promise<Company> {
  return request<Company>(`/company/${companyId}`, {
    method: "PATCH",
    token,
    body: updates,
  });
}

export function deleteCompany(token: string, companyId: string): Promise<void> {
  return request(`/company/${companyId}`, { method: "DELETE", token });
}

export function listEmployees(
  token: string,
  companyId: string
): Promise<EmployeeInfo[]> {
  return request<EmployeeInfo[]>(`/company/${companyId}/employees`, { token });
}

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

export function joinCompany(token: string, companyId: string): Promise<void> {
  return request(`/company/${companyId}/join`, {
    method: "POST",
    token,
    body: { joinCode: companyId },
  });
}

export function leaveCompany(token: string, companyId: string): Promise<void> {
  return request(`/company/${companyId}/leave`, { method: "POST", token });
}

export function getEmployeeSchedule(
  token: string,
  companyId: string,
  employeeId: string
) {
  return request(`/company/${companyId}/schedule/${employeeId}`, { token });
}

export function updateWorkingHours(
  token: string,
  companyId: string,
  workingHours: WorkingHour[]
): Promise<WorkingHour[]> {
  return request(`/company/${companyId}/working-hours`, {
    method: "PATCH",
    token,
    body: { workingHours },
  });
}

export function updateServices(
  token: string,
  companyId: string,
  services: ServiceInfo[]
): Promise<ServiceInfo[]> {
  return request(`/company/${companyId}/services`, {
    method: "PATCH",
    token,
    body: { services },
  });
}

export function getServices(
  token: string,
  companyId: string
): Promise<ServiceInfo[]> {
  return request(`/company/${companyId}/services`, { token });
}

export function deleteUser(token: string): Promise<void> {
  return request("/company/user", { method: "DELETE", token });
}
