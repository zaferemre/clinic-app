// src/services/appointmentService.ts
import * as repo from "../dataAccess/appointmentRepository";
import * as patientRepo from "../dataAccess/patientRepository";
import { Types } from "mongoose";
import { getOrSetCache, invalidateCache } from "../utils/cacheHelpers";

/**
 * List appointments with optional filters
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
 * Get appointments for a specific employee and day (busy slots)
 */
export async function getEmployeeBusySlots(
  companyId: string,
  clinicId: string,
  employeeId: string,
  day: Date
) {
  // no cache for busy slots, always live
  return repo.listEmployeeAppointmentsForDay(
    companyId,
    clinicId,
    employeeId,
    day
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
 * Create a new appointment (supports individual, group, custom)
 */
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

  // 1) create the appointment
  const appt = await repo.createAppointment(doc);

  // 2) decrement the patient’s credit by 1, only for individual with patientId and > 0
  if (appt.appointmentType === "individual" && data.patientId) {
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
 * Delete an appointment. Restore credit if applicable.
 */
export async function deleteAppointment(
  companyId: string,
  clinicId: string,
  appointmentId: string
) {
  // fetch appointment for patientId
  const toDelete = await repo.findAppointmentById(
    companyId,
    clinicId,
    appointmentId
  );
  const deleted = await repo.deleteAppointmentById(appointmentId);

  // restore credit if patientId and individual
  if (toDelete?.appointmentType === "individual" && toDelete?.patientId) {
    const pid = toDelete.patientId.toString();
    await patientRepo.updatePatientById(pid, { $inc: { credit: 1 } });
  }

  await invalidateCache(`appointment:${appointmentId}`);
  await invalidateCache(
    `appointments:${companyId}:${clinicId}:${JSON.stringify({})}`
  );

  return deleted;
}
