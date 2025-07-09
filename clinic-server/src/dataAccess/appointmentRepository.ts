// src/dataAccess/appointmentRepository.ts
import Appointment, { AppointmentDocument } from "../models/Appointment";
import { Types } from "mongoose";

export async function listAppointments(
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

export async function listEmployeeAppointmentsForDay(
  companyId: string,
  clinicId: string,
  employeeId: string,
  day: Date
): Promise<AppointmentDocument[]> {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);

  return Appointment.find({
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
    employeeId: new Types.ObjectId(employeeId),
    start: { $lt: dayEnd },
    end: { $gt: dayStart },
    status: { $ne: "cancelled" },
  }).exec();
}

export async function findAppointmentById(
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

export async function createAppointment(
  doc: Partial<AppointmentDocument>
): Promise<AppointmentDocument> {
  return Appointment.create(doc);
}

export async function updateAppointmentById(
  appointmentId: string,
  updates: Partial<AppointmentDocument>
): Promise<AppointmentDocument | null> {
  return Appointment.findByIdAndUpdate(appointmentId, updates, {
    new: true,
  }).exec();
}

export async function deleteAppointmentById(
  appointmentId: string
): Promise<AppointmentDocument | null> {
  return Appointment.findByIdAndDelete(appointmentId).exec();
}
