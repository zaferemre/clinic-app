import * as repo from "../dataAccess/appointmentRepository";
import * as patientRepo from "../dataAccess/patientRepository";
import * as serviceRepo from "../dataAccess/serviceRepository";
import createError from "http-errors";
import { Types } from "mongoose";
import { AppointmentDocument } from "../models/Appointment";
import { IUser } from "../thirdParty/firebaseAdminService";
import Employee from "../models/Employee";

// Helper to create ObjectId only from valid strings
function safeObjectId(val?: string): Types.ObjectId | undefined {
  if (typeof val === "string" && val.length === 24)
    return new Types.ObjectId(val);
  return undefined;
}
interface Filters {
  employeeId?: string;
  patientId?: string;
  groupId?: string;
}

export async function getAppointments(
  companyId: string,
  clinicId: string,
  filters: Filters
) {
  // build your mongo filter obj as before…
  const filterObj: any = {};
  if (filters.employeeId)
    filterObj.employeeId = new Types.ObjectId(filters.employeeId);
  if (filters.patientId)
    filterObj.patientId = new Types.ObjectId(filters.patientId);
  if (filters.groupId) filterObj.groupId = new Types.ObjectId(filters.groupId);

  const docs = await repo.listAppointments(companyId, clinicId, filterObj);

  const now = new Date();
  return docs.map((doc) => {
    const dto = mapDoc(doc);
    // compute “status” on the fly:
    dto.status = doc.end < now ? "done" : "scheduled";
    return dto;
  });
}

export async function getAppointmentById(
  companyId: string,
  clinicId: string,
  appointmentId: string
) {
  const doc = await repo.findAppointmentById(
    companyId,
    clinicId,
    appointmentId
  );
  if (!doc) throw createError(404, "Appointment not found");

  const dto = mapDoc(doc);
  dto.status = doc.end < new Date() ? "done" : "scheduled";
  return dto;
}

export async function createAppointment(
  companyId: string,
  clinicId: string,
  dto: {
    patientId?: string;
    groupId?: string;
    employeeId: string; // This might be email or id!
    serviceId: string;
    start: string | Date;
    end: string | Date;
    appointmentType: "individual" | "group";
  },
  user: IUser
) {
  const {
    patientId,
    groupId,
    employeeId,
    serviceId,
    start,
    end,
    appointmentType,
  } = dto;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw createError(400, "Invalid start/end dates");
  }

  // ensure service exists
  const svc =
    (await serviceRepo.findById?.(companyId, clinicId, serviceId)) ||
    (await serviceRepo.findServiceById?.(companyId, clinicId, serviceId)); // Support both function names
  if (!svc) throw createError(404, "Service not found");

  // Resolve employeeId (allow passing email)
  let employeeObjectId: Types.ObjectId;
  if (employeeId.includes("@")) {
    const emp = await Employee.findOne({
      email: employeeId,
      companyId: safeObjectId(companyId),
      clinicId: safeObjectId(clinicId),
    });
    if (!emp) throw createError(404, "Çalışan bulunamadı");
    employeeObjectId = emp._id as Types.ObjectId;
  } else {
    employeeObjectId = safeObjectId(employeeId)!;
    if (!employeeObjectId) throw createError(400, "Geçersiz çalışan ID");
  }

  // optional patient credit check
  if (patientId) {
    const patient =
      (await patientRepo.findById?.(companyId, clinicId, patientId)) ||
      (await patientRepo.findPatientById?.(companyId, clinicId, patientId));
    if (!patient) throw createError(404, "Patient not found");
    if ((patient.credit ?? 0) < 1)
      throw createError(400, "Insufficient credit");
    patient.credit = (patient.credit ?? 0) - 1;
    await patient.save();
  }

  // check overlap
  const conflict = await repo.findOverlap(
    companyId,
    employeeObjectId.toHexString(),
    startDate,
    endDate
  );
  if (conflict) throw createError(409, "Time slot conflict");

  // FINAL LOG (optional, remove if not needed)
  console.log({
    companyId,
    clinicId,
    patientId,
    groupId,
    employeeId,
    employeeObjectId,
    serviceId,
    createdBy: user.uid,
    startDate,
    endDate,
    appointmentType,
  });

  // CREATE the appointment
  const created = await repo.createAppointment({
    companyId: safeObjectId(companyId)!,
    clinicId: safeObjectId(clinicId)!,
    patientId: safeObjectId(patientId),
    groupId: safeObjectId(groupId),
    employeeId: employeeObjectId, // always an ObjectId now!
    serviceId: safeObjectId(serviceId)!,
    start: startDate,
    end: endDate,
    status: "scheduled",
    appointmentType,
    createdBy: user.uid, // always string!
  });

  return mapDoc(created);
}

export async function updateAppointment(
  companyId: string,
  clinicId: string,
  appointmentId: string,
  updates: Partial<{
    start: string | Date;
    end: string | Date;
    serviceId: string;
    employeeId: string;
    groupId?: string | null;
  }>
) {
  const up: any = {};
  if (updates.start) up.start = new Date(updates.start);
  if (updates.end) up.end = new Date(updates.end);
  if (updates.serviceId) up.serviceId = new Types.ObjectId(updates.serviceId);
  if (updates.employeeId)
    up.employeeId = new Types.ObjectId(updates.employeeId);
  if ("groupId" in updates) {
    up.groupId = updates.groupId
      ? new Types.ObjectId(updates.groupId)
      : undefined;
    up.appointmentType = updates.groupId ? "group" : "individual";
  }
  const updated = await repo.updateAppointmentById(appointmentId, up);
  if (!updated) throw createError(404, "Appointment not found");
  return mapDoc(updated);
}

export async function deleteAppointment(
  companyId: string,
  clinicId: string,
  appointmentId: string
) {
  const doc = await repo.findAppointmentById(
    companyId,
    clinicId,
    appointmentId
  );
  if (!doc) throw createError(404, "Appointment not found");

  if (doc.patientId) {
    const p = await patientRepo.findById(
      companyId,
      clinicId,
      doc.patientId.toHexString()
    );
    if (p) {
      p.credit = (p.credit ?? 0) + 1;
      await p.save();
    }
  }

  await repo.deleteAppointmentById(appointmentId);
}

function mapDoc(a: AppointmentDocument) {
  return {
    id: (a._id as any)?.toString?.() ?? "", // Defensive: handles possible proxy objects
    patientId: a.patientId ? a.patientId.toString() : undefined,
    groupId: a.groupId ? a.groupId.toString() : undefined,
    employeeId: a.employeeId ? a.employeeId.toString() : undefined,
    serviceId: a.serviceId ? a.serviceId.toString() : undefined,
    start: a.start,
    end: a.end,
    status: a.status,
    appointmentType: a.appointmentType,
    createdBy: a.createdBy ? a.createdBy.toString() : undefined,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}
