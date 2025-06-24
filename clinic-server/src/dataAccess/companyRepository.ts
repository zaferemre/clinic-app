import Clinic from "../models/Clinic";
import Company, { CompanyDocument } from "../models/Company";
import Employee from "../models/Employee";
import { Types } from "mongoose";

export async function createCompany(doc: Partial<CompanyDocument>) {
  return Company.create(doc);
}

export async function findCompanyById(id: string) {
  return Company.findById(new Types.ObjectId(id))
    .populate("clinics")
    .populate("roles")
    .exec();
}

export async function findCompanyByJoinCode(code: string) {
  return Company.findOne({ joinCode: code }).exec();
}

export async function updateCompanyById(
  id: string,
  updates: Partial<CompanyDocument>
) {
  return Company.findByIdAndUpdate(new Types.ObjectId(id), updates, {
    new: true,
  }).exec();
}

export async function deleteCompanyById(id: string) {
  return Company.findByIdAndDelete(new Types.ObjectId(id)).exec();
}

export async function listEmployees(companyId: string) {
  return Employee.find({ companyId: new Types.ObjectId(companyId) }).exec();
}

export async function addClinicToCompany(
  companyId: string,
  clinicId: Types.ObjectId
) {
  return Company.findByIdAndUpdate(
    companyId,
    { $addToSet: { clinics: clinicId } },
    { new: true }
  ).exec();
}

export async function deleteAllClinicsByCompanyId(companyId: string) {
  return Clinic.deleteMany({ companyId: new Types.ObjectId(companyId) }).exec();
}
