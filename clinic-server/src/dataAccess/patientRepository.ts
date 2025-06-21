// dataAccess/patientRepository.ts
import Patient, { PatientDocument } from "../models/Patient";
import { Types } from "mongoose";

export async function listPatients(
  companyId: string,
  clinicId: string
): Promise<PatientDocument[]> {
  return Patient.find({
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
  });
}

export async function createPatient(
  doc: Partial<PatientDocument>
): Promise<PatientDocument> {
  return Patient.create(doc);
}

export async function findPatientById(
  companyId: string,
  clinicId: string,
  patientId: string
): Promise<PatientDocument | null> {
  return Patient.findOne({
    _id: new Types.ObjectId(patientId),
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
  });
}

export async function updatePatientById(
  patientId: string,
  updates: Partial<PatientDocument>
): Promise<PatientDocument | null> {
  return Patient.findByIdAndUpdate(patientId, updates, { new: true });
}

export async function deletePatientById(patientId: string): Promise<void> {
  await Patient.findByIdAndDelete(patientId);
}

export async function addPaymentHistory(
  companyId: string,
  clinicId: string,
  patientId: string,
  entry: any
): Promise<PatientDocument | null> {
  return Patient.findOneAndUpdate(
    {
      _id: patientId,
      companyId: new Types.ObjectId(companyId),
      clinicId: new Types.ObjectId(clinicId),
    },
    { $push: { paymentHistory: entry } },
    { new: true }
  );
}

// Add groupId to multiple patients' groups array
export async function addGroupToPatients(
  patientIds: string[],
  groupId: string
) {
  return Patient.updateMany(
    { _id: { $in: patientIds } },
    { $addToSet: { groups: groupId } }
  );
}

// Remove groupId from multiple patients' groups array
export async function removeGroupFromPatients(
  patientIds: string[],
  groupId: string
) {
  return Patient.updateMany(
    { _id: { $in: patientIds } },
    { $pull: { groups: groupId } }
  );
}

// Remove groupId from all patients (on group deletion)
export async function removeGroupFromAllPatients(groupId: string) {
  return Patient.updateMany(
    { groups: groupId },
    { $pull: { groups: groupId } }
  );
}
export const findById = findPatientById;
