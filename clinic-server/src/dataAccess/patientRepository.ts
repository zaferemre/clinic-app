import Appointment from "../models/Appointment";
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

// Payment/history helpers:
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

// Group helpers:
export async function addGroupToPatients(
  patientIds: string[],
  groupId: string
) {
  return Patient.updateMany(
    { _id: { $in: patientIds } },
    { $addToSet: { groups: groupId } }
  );
}

export async function removeGroupFromPatients(
  patientIds: string[],
  groupId: string
) {
  return Patient.updateMany(
    { _id: { $in: patientIds } },
    { $pull: { groups: groupId } }
  );
}

export async function removeGroupFromAllPatients(groupId: string) {
  return Patient.updateMany(
    { groups: groupId },
    { $pull: { groups: groupId } }
  );
}

export const findById = findPatientById;

// Fetch all appointments for a patient in company/clinic
export async function getPatientAppointments(
  companyId: string,
  clinicId: string,
  patientId: string
) {
  return Appointment.find({
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
    patientId: new Types.ObjectId(patientId),
  })
    .sort({ start: -1 })
    .exec();
}

// Flag that a patient was called (can be a call history array or just a status)
export async function flagPatientCall(
  companyId: string,
  clinicId: string,
  patientId: string,
  flagType: string
) {
  // Example: add entry to callFlags array
  return Patient.findOneAndUpdate(
    {
      _id: new Types.ObjectId(patientId),
      companyId: new Types.ObjectId(companyId),
      clinicId: new Types.ObjectId(clinicId),
    },
    { $push: { callFlags: { flagType, timestamp: new Date() } } },
    { new: true }
  ).exec();
}
