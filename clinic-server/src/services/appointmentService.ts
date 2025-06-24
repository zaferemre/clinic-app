import * as repo from "../dataAccess/appointmentRepository";
import { Types } from "mongoose";
import { getOrSetCache, invalidateCache } from "../utils/cacheHelpers";

// List appointments with optional filters (cache key includes filters)
export async function getAppointments(
  companyId: string,
  clinicId: string,
  filters: any = {}
) {
  const filtersKey = JSON.stringify(filters);
  const cacheKey = `appointments:${companyId}:${clinicId}:${filtersKey}`;
  return getOrSetCache(cacheKey, () =>
    repo.listAppointments(companyId, clinicId, filters)
  );
}

// Get single appointment by ID
export async function getAppointmentById(
  companyId: string,
  clinicId: string,
  appointmentId: string
) {
  const cacheKey = `appointment:${appointmentId}`;
  return getOrSetCache(cacheKey, () =>
    repo.findAppointmentById(companyId, clinicId, appointmentId)
  );
}

// Create a new appointment
export async function createAppointment(
  companyId: string,
  clinicId: string,
  data: any,
  createdByUid: string
) {
  const doc = {
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
    ...data,
    createdBy: createdByUid,
  };
  const appt = await repo.createAppointment(doc);
  // Invalidate all list caches for this clinic/company
  await invalidateCache(
    `appointments:${companyId}:${clinicId}:${JSON.stringify({})}`
  );
  return appt;
}
// Update appointment
export async function updateAppointment(
  companyId: string,
  clinicId: string,
  appointmentId: string,
  updates: any
) {
  const updated = await repo.updateAppointmentById(appointmentId, updates);
  // Invalidate individual appointment cache and all appointment list caches for this clinic/company
  await invalidateCache(`appointment:${appointmentId}`);
  await invalidateCache(
    `appointments:${companyId}:${clinicId}:${JSON.stringify({})}`
  );
  return updated;
}

// Delete appointment
export async function deleteAppointment(
  companyId: string,
  clinicId: string,
  appointmentId: string
) {
  const deleted = await repo.deleteAppointmentById(appointmentId);
  await invalidateCache(`appointment:${appointmentId}`);
  await invalidateCache(
    `appointments:${companyId}:${clinicId}:${JSON.stringify({})}`
  );
  return deleted;
}

/**
 * Fetch all appointments tagged with createdBy = userId
 */
export async function getAppointmentsByUser(userId: string) {
  const cacheKey = `appointments:user:${userId}`;
  return getOrSetCache(cacheKey, () => repo.listAppointmentsByUser(userId));
}
