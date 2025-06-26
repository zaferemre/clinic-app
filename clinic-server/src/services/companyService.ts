import * as companyRepo from "../dataAccess/companyRepository";
import * as userRepo from "../dataAccess/userRepository";
import { v4 as uuidv4 } from "uuid";
import { CompanyDocument } from "../models/Company";
import type { Membership } from "../models/User";

/**
 * Create a new company and add the creating user as the owner in their memberships.
 */
export async function createCompany(
  uid: string,
  data: Partial<CompanyDocument>
) {
  // 1. Create the company document
  const company = await companyRepo.createCompany({
    ...data,
    ownerUid: uid,
    joinCode: uuidv4(),
  });

  // 2. Add owner membership to user
  await userRepo.addMembership(uid, {
    companyId: company._id.toString(),
    companyName: company.name,
    roles: ["owner"],
  } as Membership);

  return company;
}

/**
 * Find a company by its ID.
 */
export async function getCompanyById(companyId: string) {
  return companyRepo.findCompanyById(companyId);
}

/**
 * Get all company memberships for a user.
 */
export async function getCompaniesForUser(uid: string) {
  const user = await userRepo.findByUid(uid);
  return user?.memberships || [];
}

/**
 * Update company details (owner only).
 */
export async function updateCompany(
  companyId: string,
  updates: Partial<CompanyDocument>,
  uid: string
) {
  const company = await companyRepo.findCompanyById(companyId);
  if (!company) throw new Error("Company not found");
  if ((company as any).ownerUid !== uid) throw new Error("Unauthorized");
  return companyRepo.updateCompanyById(companyId, updates);
}

/**
 * Delete a company (owner only), **and delete all child clinics**.
 */
export async function deleteCompany(companyId: string, uid: string) {
  const company = await companyRepo.findCompanyById(companyId);
  if (!company) throw new Error("Company not found");
  if ((company as any).ownerUid !== uid) throw new Error("Unauthorized");

  // Also delete all clinics under this company
  await companyRepo.deleteAllClinicsByCompanyId(companyId);

  return companyRepo.deleteCompanyById(companyId);
}

/**
 * Join a company by invite code.
 */
export async function joinByCode(uid: string, code: string) {
  const company = await companyRepo.findCompanyByJoinCode(code);
  if (!company) return { success: false, message: "Invalid code" };

  // Add membership (avoid duplicate)
  await userRepo.addMembership(uid, {
    companyId: company._id.toString(),
    companyName: company.name,
    roles: ["staff"],
  } as Membership);

  return {
    success: true,
    companyId: company._id.toString(),
    companyName: company.name,
  };
}

/**
 * Leave a company (removes user's membership for this company).
 */
export async function leaveCompany(uid: string, companyId: string) {
  await userRepo.removeMembership(uid, companyId, "");
  return { success: true, message: "Left company" };
}

/**
 * List all employees for a company.
 */
export async function listEmployees(companyId: string) {
  return companyRepo.listEmployees(companyId);
}
