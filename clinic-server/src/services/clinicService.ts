import * as clinicRepo from "../dataAccess/clinicRepository";
import * as userRepo from "../dataAccess/userRepository";
import * as companyRepo from "../dataAccess/companyRepository";
import { getOrSetCache, invalidateCache } from "../utils/cacheHelpers";
import * as employeeRepo from "../dataAccess/employeeRepository";
import { Types } from "mongoose";
/**
 * List all clinics for a company (with cache)
 */
export async function listClinics(companyId: string) {
  const cacheKey = `company:${companyId}:clinics`;
  return getOrSetCache(cacheKey, () => clinicRepo.listClinics(companyId));
}

/**
 * Create a new clinic in the company...
 */ export async function createClinic(
  companyId: string,
  data: any,
  uid: string
) {
  // Always use Types.ObjectId for all ids
  const companyObjectId = new Types.ObjectId(companyId);

  // 1. Create the clinic
  const clinic = await clinicRepo.createClinic({
    ...data,
    companyId: companyObjectId,
  });

  // 2. Get company for name (optional)
  const company = await companyRepo.findCompanyById(companyObjectId);
  const companyName = company?.name ?? "";

  // 3. Create employee record for the owner
  await employeeRepo.createEmployee({
    userUid: uid,
    companyId: companyObjectId,
    clinicId: clinic._id,
    roles: ["owner"],
    isActive: true,
    services: [],
    workingHours: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 4. Add membership with ObjectId references
  await userRepo.addMembership(uid, {
    companyId: companyObjectId,
    companyName: companyName,
    clinicId: clinic._id,
    clinicName: clinic.name,
    roles: ["owner"],
  });

  // 5. Add clinic to company
  await companyRepo.addClinicToCompany(companyObjectId, clinic._id);

  // 6. Invalidate company clinics cache
  await invalidateCache(`company:${companyId}:clinics`);

  return clinic;
}
export async function getClinicById(companyId: string, clinicId: string) {
  const cacheKey = `clinic:${clinicId}`;
  return getOrSetCache(cacheKey, () =>
    clinicRepo.findClinicById(companyId, clinicId)
  );
}

export async function updateClinic(clinicId: string, updates: any) {
  const updated = await clinicRepo.updateClinicById(clinicId, updates);
  // Invalidate cache for this clinic and for all clinics in the parent company
  if (updated?.companyId) {
    await invalidateCache(`company:${updated.companyId.toString()}:clinics`);
  }
  await invalidateCache(`clinic:${clinicId}`);
  return updated;
}

export async function deleteClinic(clinicId: string) {
  // Find first so we can invalidate company clinics cache
  const clinic = await clinicRepo.findClinicById(undefined as any, clinicId); // fudge companyId as not needed here
  const result = await clinicRepo.deleteClinicById(clinicId);
  if (clinic?.companyId) {
    await invalidateCache(`company:${clinic.companyId.toString()}:clinics`);
  }
  await invalidateCache(`clinic:${clinicId}`);
  return result;
}
