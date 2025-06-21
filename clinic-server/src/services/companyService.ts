import { v4 as uuidv4 } from "uuid";
import createError from "http-errors";
import { IUser } from "../thirdParty/firebaseAdminService";
import * as repo from "../dataAccess/companyRepository";
import * as clinicService from "./clinicService";
import * as employeeService from "./employeeService";
import Company, { CompanyDocument } from "../models/Company";
import admin from "firebase-admin";
import mongoose from "mongoose";
export interface CompanyUserInput {
  name: string;
  websiteUrl?: string;
  socialLinks?: any;
  settings?: any;
} // CREATE COMPANY (No default clinic, no mock employee)
export async function createCompany(
  user: IUser,
  data: CompanyUserInput
): Promise<CompanyDocument> {
  if (!data.name) throw createError(400, "Company name is required");

  const company = await repo.createCompany({
    name: data.name,
    ownerUserId: user.uid,
    ownerName: user.name ?? "",
    ownerEmail: user.email,
    ownerImageUrl: user.picture ?? "",
    subscription: {
      plan: "free",
      status: "trialing",
      provider: "manual",
      maxClinics: 1,
      allowedFeatures: ["basicCalendar"],
    },
    joinCode: uuidv4(),
    settings: data.settings ?? {},
    websiteUrl: data.websiteUrl ?? "",
    socialLinks: data.socialLinks ?? {},
  });

  return company;
}

export async function getCompany(companyId: string) {
  const company = await repo.findCompanyById(companyId);
  if (!company) throw createError(404, "Company not found");
  return company;
}

export async function getCompanyByJoinCode(joinCode: string) {
  return repo.findCompanyByJoinCode(joinCode);
}

export async function updateCompany(
  companyId: string,
  updates: Partial<repo.CompanyCreateInput>,
  user: IUser
): Promise<CompanyDocument> {
  const existing = await repo.findCompanyById(companyId);
  if (!existing) throw createError(404, "Company not found");
  if (existing.ownerUserId !== user.uid)
    throw createError(403, "Only the owner can update this company");

  const updated = await repo.updateCompanyById(
    companyId,
    updates as Partial<CompanyDocument>
  );
  if (!updated) throw createError(500, "Failed to update company");
  return updated;
}

export async function deleteCompany(companyId: string, user: IUser) {
  const existing = await repo.findCompanyById(companyId);
  if (!existing) throw createError(404, "Company not found");
  if (existing.ownerUserId !== user.uid)
    throw createError(403, "Only the owner can delete this company");
  await repo.deleteCompanyById(companyId);
}

export async function joinCompany(
  companyId: string,
  joinCode: string,
  user: IUser
): Promise<CompanyDocument> {
  const company = await repo.findCompanyByJoinCode(joinCode);
  if (
    !company ||
    (company._id as mongoose.Types.ObjectId).toString() !== companyId
  )
    throw createError(400, "Invalid join code");

  const clinics = await clinicService.listClinics(companyId);
  if (!clinics.length)
    throw createError(500, "No clinic exists to assign new member");

  await employeeService.addEmployee(
    companyId,
    (clinics[0]._id as mongoose.Types.ObjectId).toString(),
    {
      email: user.email,
      name: user.name ?? "",
      role: "other",
      pictureUrl: user.picture ?? "",
    },
    user.uid
  );

  return company;
}

export async function joinByCode(joinCode: string, user: IUser) {
  const company = await repo.findCompanyByJoinCode(joinCode);
  if (!company) throw createError(400, "Invalid join code");

  const companyId = (company._id as mongoose.Types.ObjectId).toString();
  const clinics = await clinicService.listClinics(companyId);
  if (!clinics.length) throw createError(500, "No clinic exists for company");

  await employeeService.addEmployee(
    companyId,
    (clinics[0]._id as mongoose.Types.ObjectId).toString(),
    {
      email: user.email,
      name: user.name ?? "",
      role: "other",
      pictureUrl: user.picture ?? "",
    },
    user.uid
  );

  return {
    companyId,
    companyName: company.name,
    clinics: clinics.map((c) => ({
      _id: (c._id as mongoose.Types.ObjectId).toString(),
      name: c.name,
    })),
    ownerName: company.ownerName,
  };
}

export async function leaveCompany(
  companyId: string,
  userEmail: string
): Promise<void> {
  const company = await repo.findCompanyById(companyId);
  if (!company) throw createError(404, "Company not found");
  if (company.ownerEmail === userEmail)
    throw createError(400, "Owner cannot leave their own company");
  await employeeService.removeEmployeeByEmail(companyId, userEmail);
}

export async function deleteUserAccount(user: IUser) {
  // Remove user from all employees in all companies
  await Company.updateMany(
    {},
    { $pull: { "employees.email": user.email } }
  ).exec();
  await employeeService.deleteEmployeeByEmail(user.email!);
  await admin.auth().deleteUser(user.uid);
}

export async function listCompanies(user: IUser) {
  return repo.listCompaniesForUser({ uid: user.uid, email: user.email });
}
