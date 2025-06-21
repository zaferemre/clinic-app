import Appointment, { AppointmentDocument } from "../models/Appointment";
import { Types } from "mongoose";

export function listAppointments(
  companyId: string,
  clinicId: string,
  filter: Partial<Record<keyof AppointmentDocument, any>> = {}
): Promise<AppointmentDocument[]> {
  return Appointment.find({
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
    ...filter,
  }).exec();
}

export function findAppointmentById(
  companyId: string,
  clinicId: string,
  appointmentId: string
): Promise<AppointmentDocument | null> {
  return Appointment.findOne({
    _id: new Types.ObjectId(appointmentId),
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
  }).exec();
}

export function createAppointment(
  doc: Record<string, any> // or: AppointmentCreationAttrs if you want strong typing
): Promise<AppointmentDocument> {
  return Appointment.create(doc);
}

export function updateAppointmentById(
  appointmentId: string,
  updates: Partial<AppointmentDocument>
): Promise<AppointmentDocument | null> {
  return Appointment.findByIdAndUpdate(appointmentId, updates, {
    new: true,
  }).exec();
}

export function deleteAppointmentById(
  appointmentId: string
): Promise<AppointmentDocument | null> {
  return Appointment.findByIdAndDelete(appointmentId).exec();
}

export function findOverlap(
  companyId: string,
  employeeId: string,
  start: Date,
  end: Date
): Promise<AppointmentDocument | null> {
  return Appointment.findOne({
    companyId: new Types.ObjectId(companyId),
    employeeId: new Types.ObjectId(employeeId),
    $or: [
      { start: { $lt: end, $gte: start } },
      { end: { $gt: start, $lte: end } },
      { start: { $lte: start }, end: { $gte: end } },
    ],
  }).exec();
}
