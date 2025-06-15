import Patient from "../models/Patient";

export function findByCompany(companyId: string) {
  return Patient.find({ companyId }).exec();
}

export function findById(id: string) {
  return Patient.findById(id).exec();
}

export function create(data: any) {
  return new Patient(data).save();
}

export function updateById(companyId: string, patientId: string, updates: any) {
  return Patient.findOneAndUpdate({ _id: patientId, companyId }, updates, {
    new: true,
  }).exec();
}

export function deleteById(companyId: string, patientId: string) {
  return Patient.deleteOne({ _id: patientId, companyId }).exec();
}

export function recordPayment(
  companyId: string,
  patientId: string,
  payment: any
) {
  return Patient.findOneAndUpdate(
    { _id: patientId, companyId },
    { $push: { paymentHistory: { ...payment, date: new Date() } } },
    { new: true }
  ).exec();
}
