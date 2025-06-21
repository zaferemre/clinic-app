import createError from "http-errors";
import * as repo from "../dataAccess/clinicRepository";
import mongoose, { Schema } from "mongoose";
import { ClinicDocument } from "../models/Clinic";

export async function listClinics(
  companyId: string
): Promise<ClinicDocument[]> {
  return repo.listClinics(companyId);
}

export async function createClinic(
  companyId: string,
  data: Partial<ClinicDocument>
): Promise<ClinicDocument> {
  if (!data.name) throw createError(400, "Clinic name is required");
  const clinic = await repo.createClinic({
    ...data,
    companyId: new mongoose.Types.ObjectId(companyId) as any,
    isActive: true,
  });
  return clinic;
}

export async function getClinic(
  companyId: string,
  clinicId: string
): Promise<ClinicDocument> {
  const clinic = await repo.findClinicById(companyId, clinicId);
  if (!clinic) throw createError(404, "Clinic not found");
  return clinic;
}

export async function updateClinic(
  companyId: string,
  clinicId: string,
  updates: Partial<ClinicDocument>
): Promise<ClinicDocument | null> {
  return repo.updateClinicById(clinicId, updates);
}

export async function deleteClinic(
  companyId: string,
  clinicId: string
): Promise<void> {
  await repo.deleteClinicById(clinicId);
}
