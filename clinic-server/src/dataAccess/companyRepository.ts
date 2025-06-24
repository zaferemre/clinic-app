import Company, { CompanyDocument } from "../models/Company";
import Employee from "../models/Employee";
import { Types } from "mongoose";

// Create a company
export async function createCompany(doc: Partial<CompanyDocument>) {
  return Company.create(doc);
}

// Find a company by its ID
export async function findCompanyById(id: string) {
  return Company.findById(new Types.ObjectId(id))
    .populate("clinics")
    .populate("roles")
    .exec();
}

// Find a company by join code
export async function findCompanyByJoinCode(code: string) {
  return Company.findOne({ joinCode: code }).exec();
}

// List companies by owner
export async function listCompaniesByOwner(ownerUserId: string) {
  return Company.find({ ownerUserId }).exec();
}

// Update a company
export async function updateCompanyById(
  id: string,
  updates: Partial<CompanyDocument>
) {
  return Company.findByIdAndUpdate(new Types.ObjectId(id), updates, {
    new: true,
  }).exec();
}

// Delete a company
export async function deleteCompanyById(id: string) {
  return Company.findByIdAndDelete(new Types.ObjectId(id)).exec();
}

// List all employees for a company
export async function listEmployees(companyId: string) {
  return Employee.find({ companyId: new Types.ObjectId(companyId) }).exec();
}
