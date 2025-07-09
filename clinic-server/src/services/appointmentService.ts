import * as repo from "../dataAccess/appointmentRepository";
import * as patientRepo from "../dataAccess/patientRepository";
import * as employeeRepo from "../dataAccess/employeeRepository";
import * as userRepo from "../dataAccess/userRepository";
import { Types } from "mongoose";
import { getOrSetCache, invalidateCache } from "../utils/cacheHelpers";
import { createNotification } from "./notificationService";

/**
 * List appointments with optional filters
 */
export async function getAppointments(
  companyId: string,
  clinicId: string,
  filters: any = {}
) {
  const filtersKey = JSON.stringify(filters);
  const cacheKey = `appointments:${companyId}:${clinicId}:${filtersKey}`;
  return getOrSetCache(cacheKey, () =>
    repo.listAppointments(companyId, clinicId, filters)
  );
}

/**
 * Get appointments for a specific employee and day (busy slots)
 */
export async function getEmployeeBusySlots(
  companyId: string,
  clinicId: string,
  employeeId: string,
  day: Date
) {
  return repo.listEmployeeAppointmentsForDay(
    companyId,
    clinicId,
    employeeId,
    day
  );
}

/**
 * Get single appointment by ID
 */
export async function getAppointmentById(
  companyId: string,
  clinicId: string,
  appointmentId: string
) {
  const cacheKey = `appointment:${appointmentId}`;
  return getOrSetCache(cacheKey, () =>
    repo.findAppointmentById(companyId, clinicId, appointmentId)
  );
}

/**
 * Create a new appointment (supports individual, group, custom).
 * Also creates a notification for the assigned employee (if not the creator), and
 * always fills the employee name in the notification (even if missing in Employee doc).
 */
export async function createAppointment(
  companyId: string,
  clinicId: string,
  data: any,
  createdByUid: string
) {
  const doc = {
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
    ...data,
    createdBy: createdByUid,
  };

  // 1) create the appointment
  const appt = await repo.createAppointment(doc);

  // 2) decrement the patient’s credit by 1, only for individual with patientId and > 0
  if (appt.appointmentType === "individual" && data.patientId) {
    const pid = data.patientId.toString();
    const patient = await patientRepo.findPatientById(companyId, clinicId, pid);

    if (patient && typeof patient.credit === "number" && patient.credit > 0) {
      await patientRepo.updatePatientById(pid, { $inc: { credit: -1 } });
    }
  }

  // >>>>>>>>>>>> Notify assigned employee (with correct name) if different from creator
  if (appt.employeeId) {
    const emp = await employeeRepo.findEmployeeById(
      companyId,
      clinicId,
      appt.employeeId.toString()
    );

    if (emp && emp.userUid && emp.userUid !== createdByUid) {
      // Fallback: If employee.name is not set, fetch user name
      let employeeName = emp.name;
      if (!employeeName && emp.userUid) {
        const user = await userRepo.findByUid(emp.userUid);
        employeeName = user?.name;
      }

      const start = new Date(appt.start);
      const end = new Date(appt.end);
      const formatTime = (date: Date) =>
        date
          .toLocaleString("tr-TR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
          .replace(",", "");

      await createNotification(companyId, clinicId, {
        type: "system",
        status: "pending",
        title: "Yeni Randevu Oluşturuldu",
        message: `Randevu Detayı: ${formatTime(start)} - ${formatTime(
          end
        )}\nÇalışan: ${employeeName}`,
        workerUid: emp.userUid,
        targetUserId: emp.userUid,
        priority: "low",
        meta: {
          appointmentId: appt._id,
          employee: { id: emp._id, name: employeeName },
        },
      });
    }
  }
  // <<<<<<<<<<<<<

  // 3) invalidate the appointment list cache for this clinic/company
  await invalidateCache(
    `appointments:${companyId}:${clinicId}:${JSON.stringify({})}`
  );

  return appt;
}

/**
 * Update an appointment
 */
export async function updateAppointment(
  companyId: string,
  clinicId: string,
  appointmentId: string,
  updates: any
) {
  const updated = await repo.updateAppointmentById(appointmentId, updates);

  await invalidateCache(`appointment:${appointmentId}`);
  await invalidateCache(
    `appointments:${companyId}:${clinicId}:${JSON.stringify({})}`
  );

  return updated;
}

/**
 * Delete an appointment. Restore credit if applicable.
 */
export async function deleteAppointment(
  companyId: string,
  clinicId: string,
  appointmentId: string
) {
  // fetch appointment for patientId
  const toDelete = await repo.findAppointmentById(
    companyId,
    clinicId,
    appointmentId
  );
  const deleted = await repo.deleteAppointmentById(appointmentId);

  // restore credit if patientId and individual
  if (toDelete?.appointmentType === "individual" && toDelete?.patientId) {
    const pid = toDelete.patientId.toString();
    await patientRepo.updatePatientById(pid, { $inc: { credit: 1 } });
  }

  await invalidateCache(`appointment:${appointmentId}`);
  await invalidateCache(
    `appointments:${companyId}:${clinicId}:${JSON.stringify({})}`
  );

  return deleted;
}
