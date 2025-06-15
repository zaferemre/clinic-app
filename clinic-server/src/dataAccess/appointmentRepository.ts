import Appointment from "../models/Appointment";

export function findByCompany(companyId: string) {
  return Appointment.find({ companyId })
    .populate("patientId", "name")
    .populate("serviceId", "serviceName")
    .exec();
}

export function findOne(companyId: string, appointmentId: string) {
  return Appointment.findOne({ _id: appointmentId, companyId })
    .populate("patientId", "name")
    .exec();
}

export function findByPatient(companyId: string, patientId: string) {
  // returns all appointments for a given patient, sorted newest first
  return Appointment.find({ companyId, patientId }).sort({ start: -1 }).exec();
}

export function create(data: any) {
  return new Appointment(data).save();
}

export function updateById(
  companyId: string,
  appointmentId: string,
  updates: any
) {
  return Appointment.findOneAndUpdate(
    { _id: appointmentId, companyId },
    updates,
    { new: true }
  ).exec();
}

export function deleteById(companyId: string, appointmentId: string) {
  return Appointment.deleteOne({ _id: appointmentId, companyId }).exec();
}

export function findOverlap(
  companyId: string,
  employeeEmail: string,
  start: Date,
  end: Date
) {
  return Appointment.findOne({
    companyId,
    employeeEmail,
    $or: [
      { start: { $lt: end, $gte: start } },
      { end: { $gt: start, $lte: end } },
      { start: { $lte: start }, end: { $gte: end } },
    ],
  }).exec();
}

// simple stub for “owner or employee” check
export async function ensureUserIsEmployee(companyId: string, email: string) {
  const { findByIdWithAccessCheck } = await import("./companyRepository");
  const company = await findByIdWithAccessCheck(companyId, email);
  if (!company) throw { status: 403, message: "Employee not in company" };
}
