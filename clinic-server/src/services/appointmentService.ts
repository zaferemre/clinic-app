import * as repo from "../dataAccess/appointmentRepository";
import { Types } from "mongoose";

// List appointments with optional filters
export async function getAppointments(
  companyId: string,
  clinicId: string,
  filters: any = {}
) {
  // filters.employeeId is now always a string UID => pass through
  return repo.listAppointments(companyId, clinicId, filters);
}

// Get single appointment by ID
export async function getAppointmentById(
  companyId: string,
  clinicId: string,
  appointmentId: string
) {
  return repo.findAppointmentById(companyId, clinicId, appointmentId);
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
    // everything in data, including data.employeeId which is a UID string
    ...data,
    createdBy: createdByUid,
  };
  return repo.createAppointment(doc);
}

// Update appointment
export async function updateAppointment(
  companyId: string,
  clinicId: string,
  appointmentId: string,
  updates: any
) {
  return repo.updateAppointmentById(appointmentId, updates);
}

// Delete appointment
export async function deleteAppointment(
  companyId: string,
  clinicId: string,
  appointmentId: string
) {
  return repo.deleteAppointmentById(appointmentId);
}

/**
 * Fetch all appointments tagged with createdBy = userId
 */
export async function getAppointmentsByUser(userId: string) {
  return repo.listAppointmentsByUser(userId);
}
