import Company, { CompanyDocument } from "../models/Company";
import Appointment from "../models/Appointment";
import Patient from "../models/Patient";
import Group from "../models/Group";
import Notification from "../models/Notification";
import Message from "../models/Message";
import Service from "../models/Service";
import Role from "../models/Role";
import Clinic from "../models/Clinic";
import Employee from "../models/Employee";

export interface CompanyCreateInput {
  name: string;
  ownerUserId: string;
  ownerName: string;
  ownerEmail: string;
  ownerImageUrl?: string;
  subscription: CompanyDocument["subscription"];
  joinCode: string;
  settings?: Record<string, any>;
  websiteUrl?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
}

export async function createCompany(
  doc: CompanyCreateInput
): Promise<CompanyDocument> {
  return Company.create(doc);
}

export async function findCompanyById(
  id: string
): Promise<CompanyDocument | null> {
  return Company.findById(id).populate("clinics").populate("roles").exec();
}

export async function findCompanyByJoinCode(
  code: string
): Promise<CompanyDocument | null> {
  return Company.findOne({ joinCode: code }).exec();
}

export async function listCompaniesByOwner(
  ownerId: string
): Promise<CompanyDocument[]> {
  return Company.find({ ownerUserId: ownerId }).exec();
}

export async function updateCompanyById(
  id: string,
  updates: Partial<CompanyCreateInput>
): Promise<CompanyDocument | null> {
  return Company.findByIdAndUpdate(id, updates, { new: true }).exec();
}

export async function deleteCompanyById(id: string): Promise<void> {
  await Promise.all([
    Appointment.deleteMany({ companyId: id }).exec(),
    Patient.deleteMany({ companyId: id }).exec(),
    Group.deleteMany({ companyId: id }).exec(),
    Notification.deleteMany({ companyId: id }).exec(),
    Message.deleteMany({ companyId: id }).exec(),
    Service.deleteMany({ companyId: id }).exec(),
    Role.deleteMany({ companyId: id }).exec(),
    Clinic.deleteMany({ companyId: id }).exec(),
    Company.findByIdAndDelete(id).exec(),
  ]);
}

/**
 * Returns all companies where user is owner or employee (by email).
 */
export async function listCompaniesForUser(user: {
  uid: string;
  email: string;
}): Promise<CompanyDocument[]> {
  // 1. Owned companies
  const ownedCompanies = await Company.find({ ownerUserId: user.uid });

  // 2. Employees with this email
  const employees = await Employee.find({ email: user.email });
  const clinicIds = employees.map((emp) => emp.clinicId);

  // 3. Clinics where user is an employee
  const clinics = await Clinic.find({ _id: { $in: clinicIds } });
  const companyIdsFromClinics = clinics.map((clinic) =>
    clinic.companyId instanceof Object
      ? clinic.companyId.toString()
      : clinic.companyId
  );

  // 4. Companies by those IDs
  const memberCompanies = await Company.find({
    _id: { $in: companyIdsFromClinics },
  });

  // 5. Merge, dedupe by _id
  const allCompanies = [
    ...ownedCompanies,
    ...memberCompanies.filter(
      (mc) =>
        !ownedCompanies.some(
          (oc) =>
            oc._id &&
            typeof oc._id === "object" &&
            "equals" in oc._id &&
            typeof oc._id.equals === "function" &&
            oc._id.equals(mc._id)
        )
    ),
  ];

  return allCompanies;
}
