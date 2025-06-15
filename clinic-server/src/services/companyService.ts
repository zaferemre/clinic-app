import { IUser } from "../thirdParty/firebaseAdminService";
import * as repo from "../dataAccess/companyRepository";
import type { Company } from "../models/Company";

/**
 * Create a new company with the authenticated user as owner.
 */
export function createCompany(user: IUser, body: any): Promise<Company> {
  return repo.create({
    ownerEmail: user.email,
    ownerName: user.name || "",
    ownerImageUrl: user.picture || "",
    ...body,
    roles: ["owner", "admin", "manager", "staff"],
    employees: [
      {
        email: user.email,
        name: user.name,
        pictureUrl: user.picture,
        role: "owner",
      },
    ],
  });
}

/**
 * Get the company for the user. If companyId is provided, enforce access check.
 * If companyId is undefined, look up by the authenticated user's email.
 */
export async function getCompany(
  companyId: string | undefined,
  user: IUser
): Promise<Company> {
  let company: Company | null;
  if (companyId) {
    company = await repo.findByIdWithAccessCheck(companyId, user.email);
  } else {
    company = await repo.findByEmail(user.email);
  }

  if (!company) {
    const err: any = new Error("Company not found");
    err.status = 404;
    throw err;
  }
  return company;
}

/**
 * Update top-level company fields. Only owner may call.
 */
export function updateCompany(
  companyId: string,
  updates: any,
  user: IUser
): Promise<Company | null> {
  return repo.updateByIdWithOwnerCheck(companyId, user.email, updates);
}

/**
 * Delete a company and cascade-remove data. Only owner may call.
 */
export function deleteCompany(companyId: string, user: IUser): Promise<void> {
  return repo.deleteByIdWithCascade(companyId, user.email);
}

/**
 * List employees (including owner) for a company.
 */
export function listEmployees(companyId: string) {
  return repo.listEmployees(companyId);
}

/**
 * Add a new employee record.
 */
export function addEmployee(companyId: string, dto: any) {
  return repo.addEmployee(companyId, dto);
}

/**
 * Update an existing employee by subdocument ID.
 */
export function updateEmployee(
  companyId: string,
  employeeId: string,
  updates: any
) {
  return repo.updateEmployee(companyId, employeeId, updates);
}

/**
 * Remove an employee by subdocument ID.
 */
export function deleteEmployee(
  companyId: string,
  employeeId: string
): Promise<void> {
  return repo.deleteEmployee(companyId, employeeId);
}

/**
 * Join a company using a join code. Authenticated user cannot be owner.
 */
export function joinCompany(
  companyId: string,
  joinCode: string,
  user: IUser
): Promise<any> {
  return repo.joinCompany(companyId, joinCode, user);
}

/**
 * Leave a company. Owner cannot leave.
 */
export function leaveCompany(
  companyId: string,
  userEmail: string
): Promise<void> {
  return repo.leaveCompany(companyId, userEmail);
}

/**
 * Get schedule for an employee. Owner can view all; employees only their own.
 */
export function getEmployeeSchedule(
  companyId: string,
  employeeId: string,
  requesterEmail: string
) {
  return repo.getEmployeeSchedule(companyId, employeeId, requesterEmail);
}

/**
 * Update the company's working hours. Only owner may call.
 */
export function updateWorkingHours(
  companyId: string,
  workingHours: any,
  user: IUser
) {
  return repo.updateByIdWithOwnerCheck(companyId, user.email, { workingHours });
}

/**
 * Update the company's services. Only owner may call.
 */
export function updateServices(
  companyId: string,
  services: any[],
  user: IUser
) {
  return repo.updateByIdWithOwnerCheck(companyId, user.email, { services });
}

/**
 * Fetch the company's services (no ACL required beyond existence).
 */
export function getServices(companyId: string) {
  return repo.getServices(companyId);
}

/**
 * Delete the current user's account and remove from companies.
 */
export function deleteUserAccount(email: string, uid?: string) {
  return repo.deleteUserAccount(email, uid);
}
