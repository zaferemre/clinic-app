import Appointment, { AppointmentDocument } from "../models/Appointment";
import { Types } from "mongoose";

// List appointments, with optional filters
export async function listAppointments(
  companyId: string,
  clinicId: string,
  filter: Partial<Record<keyof AppointmentDocument, any>> = {}
): Promise<AppointmentDocument[]> {
  return Appointment.find({
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
    ...filter, // employeeId here is a string
  }).exec();
}

// Find single appointment by ID within company/clinic
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

// Create a new appointment
export async function createAppointment(
  doc: Partial<AppointmentDocument>
): Promise<AppointmentDocument> {
  return Appointment.create(doc);
}

// Update an existing appointment by ID
export async function updateAppointmentById(
  appointmentId: string,
  updates: Partial<AppointmentDocument>
): Promise<AppointmentDocument | null> {
  return Appointment.findByIdAndUpdate(appointmentId, updates, {
    new: true,
  }).exec();
}

// Delete an appointment by ID
export async function deleteAppointmentById(
  appointmentId: string
): Promise<AppointmentDocument | null> {
  return Appointment.findByIdAndDelete(appointmentId).exec();
}
