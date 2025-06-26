import * as clinicRepo from "../dataAccess/clinicRepository";
import * as userRepo from "../dataAccess/userRepository";
import * as companyRepo from "../dataAccess/companyRepository";
import { getOrSetCache, invalidateCache } from "../utils/cacheHelpers";

/**
 * List all clinics for a company (with cache)
 */
export async function listClinics(companyId: string) {
  const cacheKey = `company:${companyId}:clinics`;
  return getOrSetCache(cacheKey, () => clinicRepo.listClinics(companyId));
}

/**
 * Create a new clinic in the company...
 */
export async function createClinic(companyId: string, data: any, uid: string) {
  const clinic = await clinicRepo.createClinic({
    ...data,
    companyId,
  });

  const company = await companyRepo.findCompanyById(companyId);
  const companyName = company?.name ?? "";

  await userRepo.addMembership(uid, {
    companyId: companyId,
    companyName: companyName,
    clinicId: clinic._id.toString(),
    clinicName: clinic.name,
    roles: ["owner"],
  });

  await companyRepo.addClinicToCompany(companyId, clinic._id);

  // Invalidate company clinics cache
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
