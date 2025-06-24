import * as repoPat from "../dataAccess/patientRepository";
import createError from "http-errors";
import { Types } from "mongoose";

export async function getPatients(companyId: string, clinicId: string) {
  return repoPat.listPatients(companyId, clinicId);
}

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
  return repoPat.createPatient(doc);
}

export async function getPatientById(
  companyId: string,
  clinicId: string,
  patientId: string
) {
  const patient = await repoPat.findPatientById(companyId, clinicId, patientId);
  if (!patient) throw createError(404, "Patient not found");
  return patient;
}

export async function updatePatient(
  companyId: string,
  clinicId: string,
  patientId: string,
  updates: any
) {
  return repoPat.updatePatientById(patientId, updates);
}

export async function deletePatient(
  companyId: string,
  clinicId: string,
  patientId: string
) {
  return repoPat.deletePatientById(patientId);
}

export async function recordPayment(
  companyId: string,
  clinicId: string,
  patientId: string,
  entry: any
) {
  return repoPat.addPaymentHistory(companyId, clinicId, patientId, entry);
}

export async function getPatientAppointments(
  companyId: string,
  clinicId: string,
  patientId: string
) {
  return repoPat.getPatientAppointments(companyId, clinicId, patientId);
}

export async function flagPatientCall(
  companyId: string,
  clinicId: string,
  patientId: string,
  flagType: string
) {
  // You could expand this for different flag types in the future
  return repoPat.flagPatientCall(companyId, clinicId, patientId, flagType);
}
