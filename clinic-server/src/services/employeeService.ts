import * as empRepo from "../dataAccess/employeeRepository";

// By userUid (clinic management)
export async function upsertEmployee(
  companyId: string,
  clinicId: string,
  userUid: string,
  data: any
) {
  return empRepo.upsertEmployee(companyId, clinicId, userUid, data);
}

// List by company/clinic
export async function listEmployees(companyId: string, clinicId?: string) {
  return empRepo.listEmployees(companyId, clinicId);
}

export async function removeEmployee(
  companyId: string,
  clinicId: string,
  userUid: string
) {
  return empRepo.removeEmployee(companyId, clinicId, userUid);
}

// Basic CRUD (for admin panel etc)
export async function addEmployee(companyId: string, data: any) {
  return empRepo.createEmployee(data);
}
export async function updateEmployee(employeeId: string, data: any) {
  return empRepo.updateEmployee(employeeId, data);
}
export async function deleteEmployee(employeeId: string) {
  return empRepo.deleteEmployee(employeeId);
}
