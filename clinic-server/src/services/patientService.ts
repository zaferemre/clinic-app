import * as repoPat from "../dataAccess/patientRepository";
import createError from "http-errors";
import { Types } from "mongoose";
import { getOrSetCache, invalidateCache } from "../utils/cacheHelpers";

/**
 * Get all patients for a company and clinic (with caching)
 */
export async function getPatients(companyId: string, clinicId: string) {
  const cacheKey = `patients:${companyId}:${clinicId}`;
  return getOrSetCache(cacheKey, () =>
    repoPat.listPatients(companyId, clinicId)
  );
}

/**
 * Create a new patient and invalidate the patient list cache
 */
export async function createPatient(
  companyId: string,
  clinicId: string,
  data: any
) {
  const doc = {
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
    ...data,
    credit: typeof data.credit === "number" ? data.credit : 0,
  };
  const created = await repoPat.createPatient(doc);
  await invalidateCache(`patients:${companyId}:${clinicId}`);
  return created;
}

/**
 * Get a single patient by ID
 */
export async function getPatientById(
  companyId: string,
  clinicId: string,
  patientId: string
) {
  const patient = await repoPat.findPatientById(companyId, clinicId, patientId);
  if (!patient) throw createError(404, "Patient not found");
  return patient;
}

/**
 * Update a patient and invalidate the patient list cache
 */
export async function updatePatient(
  companyId: string,
  clinicId: string,
  patientId: string,
  updates: any
) {
  const updated = await repoPat.updatePatientById(patientId, updates);
  await invalidateCache(`patients:${companyId}:${clinicId}`);
  return updated;
}

/**
 * Delete a patient and invalidate the patient list cache
 */
export async function deletePatient(
  companyId: string,
  clinicId: string,
  patientId: string
) {
  const deleted = await repoPat.deletePatientById(patientId);
  await invalidateCache(`patients:${companyId}:${clinicId}`);
  return deleted;
}

/**
 * Add a payment entry for the patient (invalidate patient list if you want)
 */
export async function recordPayment(
  companyId: string,
  clinicId: string,
  patientId: string,
  entry: any
) {
  const updated = await repoPat.addPaymentHistory(
    companyId,
    clinicId,
    patientId,
    entry
  );
  await invalidateCache(`patients:${companyId}:${clinicId}`); // Optional: invalidate cache if payment info is surfaced in the list
  return updated;
}

/**
 * Get all appointments for a patient (no cache here, can add if needed)
 */
export async function getPatientAppointments(
  companyId: string,
  clinicId: string,
  patientId: string
) {
  return repoPat.getPatientAppointments(companyId, clinicId, patientId);
}

/**
 * Flag a patient for a call (no cache, but could invalidate if flag info is in list)
 */
export async function flagPatientCall(
  companyId: string,
  clinicId: string,
  patientId: string,
  flagType: string
) {
  const flagged = await repoPat.flagPatientCall(
    companyId,
    clinicId,
    patientId,
    flagType
  );
  await invalidateCache(`patients:${companyId}:${clinicId}`); // Optional, as above
  return flagged;
}
