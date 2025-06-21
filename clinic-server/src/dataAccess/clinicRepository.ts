import Clinic, { ClinicDocument } from "../models/Clinic";
import mongoose from "mongoose";

// List all clinics for a company
export async function listClinics(
  companyId: string
): Promise<ClinicDocument[]> {
  return Clinic.find({
    companyId: new mongoose.Types.ObjectId(companyId),
  }).exec();
}

// Create a new Clinic document
export async function createClinic(
  doc: Partial<ClinicDocument>
): Promise<ClinicDocument> {
  return Clinic.create(doc);
}

// Find clinic by ID and companyId
export async function findClinicById(
  companyId: string,
  clinicId: string
): Promise<ClinicDocument | null> {
  return Clinic.findOne({
    _id: new mongoose.Types.ObjectId(clinicId),
    companyId: new mongoose.Types.ObjectId(companyId),
  }).exec();
}

// Update a clinic by its ID
export function updateClinicById(
  clinicId: string,
  updates: Partial<ClinicDocument>
) {
  return Clinic.findByIdAndUpdate(clinicId, updates, { new: true }).exec();
}

// Delete a clinic by its ID
export function deleteClinicById(clinicId: string) {
  return Clinic.findByIdAndDelete(clinicId).exec();
}
