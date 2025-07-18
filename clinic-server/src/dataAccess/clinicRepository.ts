import Clinic, { ClinicDocument } from "../models/Clinic";

export async function createClinic(
  doc: Partial<ClinicDocument>
): Promise<ClinicDocument> {
  return Clinic.create(doc);
}

export async function listClinics(companyId: string) {
  return Clinic.find({ companyId });
}

export async function findClinicById(companyId: string, clinicId: string) {
  return Clinic.findOne({ _id: clinicId, companyId });
}

export async function updateClinicById(
  clinicId: string,
  updates: Partial<ClinicDocument>
) {
  return Clinic.findByIdAndUpdate(clinicId, updates, { new: true });
}

export async function deleteClinicById(clinicId: string) {
  return Clinic.findByIdAndDelete(clinicId);
}
export async function getKvkk(clinicId: string) {
  return Clinic.findById(clinicId, "kvkkText kvkkRequired kvkkLastSetAt");
}

export async function setKvkk(
  clinicId: string,
  kvkkText: string,
  kvkkRequired: boolean
) {
  return Clinic.findByIdAndUpdate(
    clinicId,
    {
      kvkkText,
      kvkkRequired,
      kvkkLastSetAt: new Date(),
    },
    { new: true }
  );
}
