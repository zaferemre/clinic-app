// src/services/appointmentService.ts
import * as repo from "../dataAccess/appointmentRepository";
import * as patientRepo from "../dataAccess/patientRepository";
import { IUser } from "../thirdParty/firebaseAdminService";

export async function getAppointments(companyId: string) {
  const appts = await repo.findByCompany(companyId);
  return appts.map((appt) => ({
    id: appt._id.toString(),
    title: appt.patientId?.name ?? "Randevu",
    start: appt.start,
    end: appt.end,
    serviceId: appt.serviceId?.toString() ?? "",
    extendedProps: {
      employeeEmail: appt.employeeEmail ?? "",
      serviceId: appt.serviceId?.toString() ?? "",
      patientId:
        appt.patientId?._id?.toString?.() ?? appt.patientId?.toString?.() ?? "",
    },
    color:
      appt.status === "done"
        ? "#6b7280"
        : appt.status === "cancelled"
        ? "#ef4444"
        : "#3b82f6",
  }));
}

export async function getAppointmentById(
  companyId: string,
  appointmentId: string
) {
  const appt = await repo.findOne(companyId, appointmentId);
  if (!appt) throw new Error("Appointment not found");
  return {
    id: appt._id.toString(),
    title: appt.patientId?.name ?? "Randevu",
    start: appt.start,
    end: appt.end,
    serviceId: appt.serviceId?.toString() ?? "",
    extendedProps: {
      employeeEmail: appt.employeeEmail ?? "",
      serviceId: appt.serviceId?.toString() ?? "",
      patientId:
        appt.patientId?._id?.toString?.() ?? appt.patientId?.toString?.() ?? "",
    },
  };
}

export async function createAppointment(
  companyId: string,
  dto: any,
  user: IUser
) {
  const { patientId, employeeEmail, serviceId, start, end } = dto;
  const newStart = new Date(start),
    newEnd = new Date(end);
  if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
    throw { status: 400, message: "Invalid datetime" };
  }

  // ✅ Pass companyId into findById
  const patient = await patientRepo.findById(companyId, patientId);
  if (!patient) throw { status: 404, message: "Patient not found" };
  if (patient.companyId.toString() !== companyId)
    throw { status: 403, message: "Patient not in this company" };

  // owner/employee check
  await repo.ensureUserIsEmployee(companyId, employeeEmail);

  if (patient.credit < 1) throw { status: 400, message: "Insufficient credit" };

  const overlap = await repo.findOverlap(
    companyId,
    employeeEmail,
    newStart,
    newEnd
  );
  if (overlap) throw { status: 409, message: "Timeslot taken" };

  // debit one credit
  patient.credit -= 1;
  await patient.save();

  return repo.create({
    companyId,
    patientId,
    employeeEmail,
    serviceId,
    start: newStart,
    end: newEnd,
    status: "scheduled",
  });
}

export async function updateAppointment(
  companyId: string,
  appointmentId: string,
  dto: any
) {
  const { start, end, serviceId, employeeEmail } = dto;
  const newStart = new Date(start),
    newEnd = new Date(end);
  if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
    throw { status: 400, message: "Invalid datetime" };
  }
  return repo.updateById(companyId, appointmentId, {
    start: newStart,
    end: newEnd,
    serviceId,
    employeeEmail,
  });
}

export async function deleteAppointment(
  companyId: string,
  appointmentId: string
) {
  const appt = await repo.findOne(companyId, appointmentId);
  if (!appt) throw { status: 404, message: "Appointment not found" };

  // ✅ Pass companyId into findById here as well
  const patient = await patientRepo.findById(
    companyId,
    appt.patientId.toString()
  );
  if (patient) {
    patient.credit += 1;
    await patient.save();
  }

  await repo.deleteById(companyId, appointmentId);
}
