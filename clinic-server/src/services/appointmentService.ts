// src/services/appointmentService.ts
import * as repo from "../dataAccess/appointmentRepository";
import * as patientRepo from "../dataAccess/patientRepository";
import { Types } from "mongoose";
import { getOrSetCache, invalidateCache } from "../utils/cacheHelpers";

/**
 * List appointments with optional filters (cache key includes filters)
 */
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

/**
 * Get single appointment by ID
 */
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

/**
 * Create a new appointment.
 *   - We only decrement the patient's credit if it's > 0.
 */
export async function createAppointment(
  companyId: string,
  clinicId: string,
  data: any, // must include data.patientId
  createdByUid: string
) {
  const doc = {
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
    ...data,
    createdBy: createdByUid,
  };

  // 1) create the appointment
  const appt = await repo.createAppointment(doc);

  // 2) decrement the patient’s credit by 1, but only if current credit > 0
  if (data.patientId) {
    const pid = data.patientId.toString();
    const patient = await patientRepo.findPatientById(companyId, clinicId, pid);

    if (patient && typeof patient.credit === "number" && patient.credit > 0) {
      await patientRepo.updatePatientById(pid, { $inc: { credit: -1 } });
    }
  }

  // 3) invalidate the appointment list cache for this clinic/company
  await invalidateCache(
    `appointments:${companyId}:${clinicId}:${JSON.stringify({})}`
  );

  return appt;
}

/**
 * Update an appointment
 */
export async function updateAppointment(
  companyId: string,
  clinicId: string,
  appointmentId: string,
  updates: any
) {
  const updated = await repo.updateAppointmentById(appointmentId, updates);

  await invalidateCache(`appointment:${appointmentId}`);
  await invalidateCache(
    `appointments:${companyId}:${clinicId}:${JSON.stringify({})}`
  );

  return updated;
}

/**
 * Delete an appointment.
 *   - We always restore 1 credit back to the patient.
 */
export async function deleteAppointment(
  companyId: string,
  clinicId: string,
  appointmentId: string
) {
  // 1) fetch appointment so we know its patientId
  const toDelete = await repo.findAppointmentById(
    companyId,
    clinicId,
    appointmentId
  );

  // 2) delete the appointment
  const deleted = await repo.deleteAppointmentById(appointmentId);

  // 3) give the patient back 1 credit
  if (toDelete?.patientId) {
    const pid = toDelete.patientId.toString();
    await patientRepo.updatePatientById(pid, { $inc: { credit: 1 } });
  }

  // 4) invalidate caches
  await invalidateCache(`appointment:${appointmentId}`);
  await invalidateCache(
    `appointments:${companyId}:${clinicId}:${JSON.stringify({})}`
  );

  return deleted;
}
