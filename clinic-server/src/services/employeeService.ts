import * as repo from "../dataAccess/employeeRepository";

export function listEmployees(companyId: string) {
  return repo.findByCompany(companyId);
}

export function addEmployee(companyId: string, dto: any) {
  return repo.addEmployee(companyId, dto);
}

export function updateEmployee(
  companyId: string,
  employeeId: string,
  updates: any
) {
  return repo.updateEmployee(companyId, employeeId, updates);
}

export function deleteEmployee(companyId: string, employeeId: string) {
  return repo.deleteEmployee(companyId, employeeId);
}
