// src/services/patientService.ts
import { Types } from "mongoose";
import createError from "http-errors";
import * as repoPat from "../dataAccess/patientRepository";
import * as apptRepo from "../dataAccess/appointmentRepository";
import * as notifRepo from "../dataAccess/notificationRepository";

/** Create a new patient under a company & clinic. */
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
  console.log("Creating patient with:", doc);
  return repoPat.createPatient(doc);
}

/** List patients for a company & clinic */
export async function getPatients(companyId: string, clinicId: string) {
  return repoPat.listPatients(companyId, clinicId);
}

/** Get one patient by ID */
export async function getPatientById(
  companyId: string,
  clinicId: string,
  patientId: string
) {
  const patient = await repoPat.findPatientById(companyId, clinicId, patientId);
  if (!patient) throw createError(404, "Patient not found");
  return patient;
}

/** Update patient fields */
export async function updatePatient(
  companyId: string,
  clinicId: string,
  patientId: string,
  updates: any
) {
  return repoPat.updatePatientById(patientId, updates);
}

/** Record a payment in the patient’s history */
export async function recordPayment(
  companyId: string,
  clinicId: string,
  patientId: string,
  entry: {
    method: "Havale" | "Card" | "Cash" | "Unpaid";
    amount: number;
    note?: string;
  }
) {
  return repoPat.addPaymentHistory(companyId, clinicId, patientId, entry);
}

/** List a patient’s appointments */
export async function getPatientAppointments(
  companyId: string,
  clinicId: string,
  patientId: string
) {
  return apptRepo.listAppointments(companyId, clinicId, {
    patientId: new Types.ObjectId(patientId),
  });
}

/** Flag a patient for a call (creates a notification) */
export async function flagPatientCall(
  companyId: string,
  clinicId: string,
  patientId: string,
  note: string,
  workerId: string
) {
  const doc = {
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
    patientId: new Types.ObjectId(patientId),
    type: "call" as const,
    status: "pending" as const,
    message: `Flagged patient call${note ? ": " + note : ""}`,
    trigger: "patient-call" as const,
    createdBy: new Types.ObjectId(workerId),
    note,
  };
  return notifRepo.createNotification(doc);
}

/** List notifications for company & clinic */
export async function getNotifications(companyId: string, clinicId: string) {
  return notifRepo.listNotifications(companyId, clinicId);
}

/** Mark a notification as done */
export async function markPatientCalled(
  companyId: string,
  clinicId: string,
  notificationId: string
) {
  return notifRepo.updateNotificationStatus(notificationId, "done");
}

/** Delete a patient record */
export async function deletePatient(
  companyId: string,
  clinicId: string,
  patientId: string
) {
  return repoPat.deletePatientById(patientId);
}
