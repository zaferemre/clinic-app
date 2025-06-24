import * as clinicRepo from "../dataAccess/clinicRepository";
import * as userRepo from "../dataAccess/userRepository";
import * as employeeRepo from "../dataAccess/employeeRepository";
import * as companyRepo from "../dataAccess/companyRepository";
import { v4 as uuidv4 } from "uuid";
import { Types } from "mongoose";

/**
 * List all clinics for a company
 */
export async function listClinics(companyId: string) {
  return clinicRepo.listClinics(companyId);
}

/**
 * Create a new clinic in the company, add the user as:
 * - Clinic admin (employee)
 * - UserMembership entry for the clinic
 */
export async function createClinic(companyId: string, data: any, uid: string) {
  // 1. Create the clinic
  const clinic = await clinicRepo.createClinic({
    ...data,
    companyId,
  });

  // 2. Fetch company for name
  const company = await companyRepo.findCompanyById(companyId);
  const companyName = company?.name ?? "";

  // 3. Add employee (admin) to this clinic
  await employeeRepo.createEmployee({
    userUid: uid,
    companyId: new Types.ObjectId(companyId),
    clinicId: clinic.id.toString(), // safer: always as ObjectId
    roles: ["owner"],
    isActive: true,
  });

  // 4. Add clinic membership to the user
  await userRepo.addMembership(uid, {
    companyId,
    companyName,
    clinicId: clinic.id.toString(),
    clinicName: clinic.name,
    roles: ["owner"], // or "owner" if that's your convention
  });

  return clinic;
}

export async function getClinicById(companyId: string, clinicId: string) {
  return clinicRepo.findClinicById(companyId, clinicId);
}

export async function updateClinic(clinicId: string, updates: any) {
  return clinicRepo.updateClinicById(clinicId, updates);
}

export async function deleteClinic(clinicId: string) {
  return clinicRepo.deleteClinicById(clinicId);
}
