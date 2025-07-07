import * as companyRepo from "../dataAccess/companyRepository";
import * as userRepo from "../dataAccess/userRepository";
import { v4 as uuidv4 } from "uuid";
import { Types } from "mongoose";
import { CompanyDocument } from "../models/Company";

/**
 * Create a new company and add the creating user as the owner in their memberships.
 */
export async function createCompany(
  uid: string,
  data: Partial<CompanyDocument>
) {
  console.log("companyService.createCompany - gelen data:", data);

  // 1. Create the company document
  const company = await companyRepo.createCompany({
    ...data,
    ownerUid: uid,
    joinCode: uuidv4(),
  });

  // 2. Add owner membership to user (companyId as Types.ObjectId)
  await userRepo.addMembership(uid, {
    companyId: company._id,
    companyName: company.name,
    roles: ["owner"],
  });

  return company;
}

/**
 * Find a company by its ID.
 */
export async function getCompanyById(companyId: Types.ObjectId) {
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
  companyId: Types.ObjectId,
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
export async function deleteCompany(companyId: Types.ObjectId, uid: string) {
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

  // Add membership (avoid duplicate, companyId as Types.ObjectId)
  await userRepo.addMembership(uid, {
    companyId: company._id,
    companyName: company.name,
    roles: ["staff"],
  });

  return {
    success: true,
    companyId: company._id, // send as OID to backend clients, or use .toString() for frontend if needed
    companyName: company.name,
  };
}

/**
 * Leave a company (removes user's membership for this company).
 */
export async function leaveCompany(uid: string, companyId: Types.ObjectId) {
  await userRepo.removeMembershipAndEmployee(uid, companyId);
  return { success: true, message: "Left company" };
}

/**
 * List all employees for a company.
 */
export async function listEmployees(companyId: Types.ObjectId) {
  return companyRepo.listEmployees(companyId);
}
