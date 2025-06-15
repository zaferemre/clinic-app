import { EmployeeInfo } from "../types/sharedTypes";
import { request } from "./apiClient";

export function getEmployees(
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
