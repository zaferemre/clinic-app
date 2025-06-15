import * as repo from "../dataAccess/patientRepository";
import * as apptRepo from "../dataAccess/appointmentRepository";
import * as notifRepo from "../dataAccess/notificationRepository";
import createError from "http-errors";

export async function createPatient(companyId: string, dto: any) {
  return repo.create({
    ...dto,
    companyId,
    credit: 0,
    paymentHistory: dto.paymentHistory ?? [],
  });
}

export async function getPatients(companyId: string) {
  return repo.findByCompany(companyId);
}

// ← new
export async function getPatientById(companyId: string, patientId: string) {
  const patient = await repo.findById(companyId, patientId);
  if (!patient) throw createError(404, "Patient not found");
  return patient;
}

export async function updatePatient(
  companyId: string,
  patientId: string,
  updates: any
) {
  return repo.updateById(companyId, patientId, updates);
}

export async function recordPayment(
  companyId: string,
  patientId: string,
  body: any
) {
  const { method, amount, note } = body;
  return repo.recordPayment(companyId, patientId, { method, amount, note });
}

export async function getPatientAppointments(
  companyId: string,
  patientId: string
) {
  return apptRepo.findByPatient(companyId, patientId);
}

export async function flagPatientCall(
  companyId: string,
  patientId: string,
  note: string,
  workerEmail: string
) {
  return notifRepo.create({
    companyId,
    patientId,
    type: "call",
    status: "pending",
    workerEmail,
    note,
  });
}

export async function getNotifications(companyId: string) {
  return notifRepo.findPendingByCompany(companyId);
}

export async function markPatientCalled(
  companyId: string,
  notificationId: string
) {
  return notifRepo.markDone(companyId, notificationId);
}

export async function deletePatient(companyId: string, patientId: string) {
  return repo.deleteById(companyId, patientId);
}
