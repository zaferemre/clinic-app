import Clinic from "../models/Clinic";
import Company, { CompanyDocument } from "../models/Company";
import Employee from "../models/Employee";
import { Types } from "mongoose";

export async function createCompany(doc: Partial<CompanyDocument>) {
  return Company.create(doc);
}

export async function findCompanyById(id: Types.ObjectId) {
  return Company.findById(id).populate("clinics").populate("roles").exec();
}

export async function findCompanyByJoinCode(code: string) {
  return Company.findOne({ joinCode: code }).exec();
}

export async function updateCompanyById(
  id: Types.ObjectId,
  updates: Partial<CompanyDocument>
) {
  return Company.findByIdAndUpdate(id, updates, { new: true }).exec();
}

export async function deleteCompanyById(id: Types.ObjectId) {
  return Company.findByIdAndDelete(id).exec();
}

export async function listEmployees(companyId: Types.ObjectId) {
  return Employee.find({ companyId }).exec();
}

export async function addClinicToCompany(
  companyId: Types.ObjectId,
  clinicId: Types.ObjectId
) {
  return Company.findByIdAndUpdate(
    companyId,
    { $addToSet: { clinics: clinicId } },
    { new: true }
  ).exec();
}

export async function deleteAllClinicsByCompanyId(companyId: Types.ObjectId) {
  return Clinic.deleteMany({ companyId }).exec();
}
