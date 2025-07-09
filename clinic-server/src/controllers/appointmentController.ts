// src/controllers/appointmentController.ts
import { RequestHandler } from "express";
import * as appointmentService from "../services/appointmentService";

/**
 * List appointments (optionally filter by employeeId, patientId, groupId, etc.)
 */
export const listAppointments: RequestHandler = async (req, res, next) => {
  try {
    const filters: any = {};
    if (req.query.employeeId) filters.employeeId = req.query.employeeId;
    if (req.query.patientId) filters.patientId = req.query.patientId;
    if (req.query.groupId) filters.groupId = req.query.groupId;
    if (req.query.appointmentType)
      filters.appointmentType = req.query.appointmentType;

    const appointments = await appointmentService.getAppointments(
      req.params.companyId,
      req.params.clinicId,
      filters
    );
    res.json(appointments);
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single appointment
 */
export const getAppointment: RequestHandler = async (req, res, next) => {
  try {
    const appointment = await appointmentService.getAppointmentById(
      req.params.companyId,
      req.params.clinicId,
      req.params.appointmentId
    );
    if (!appointment) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(appointment);
  } catch (err) {
    next(err);
  }
};

/**
 * Get busy slots for employee on a given day
 * GET /company/:companyId/clinics/:clinicId/employees/:employeeId/busy?date=YYYY-MM-DD
 */
export const getEmployeeBusySlots: RequestHandler = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { date } = req.query;
    if (!date) {
      res.status(400).json({ error: "date is required" });
      return;
    }
    const day = new Date(date as string);

    const busy = await appointmentService.getEmployeeBusySlots(
      req.params.companyId,
      req.params.clinicId,
      employeeId,
      day
    );
    // Output: [{ start: Date, end: Date }, ...]
    res.json(
      busy.map((a) => ({
        start: a.start,
        end: a.end,
      }))
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Create new appointment
 */
export const createAppointment: RequestHandler = async (req, res, next) => {
  try {
    const uid = (req.user as any)?.uid;
    if (!uid) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const created = await appointmentService.createAppointment(
      req.params.companyId,
      req.params.clinicId,
      req.body,
      uid
    );
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

/**
 * Update appointment
 */
export const updateAppointment: RequestHandler = async (req, res, next) => {
  try {
    const updated = await appointmentService.updateAppointment(
      req.params.companyId,
      req.params.clinicId,
      req.params.appointmentId,
      req.body
    );
    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete appointment
 */
export const deleteAppointment: RequestHandler = async (req, res, next) => {
  try {
    const deleted = await appointmentService.deleteAppointment(
      req.params.companyId,
      req.params.clinicId,
      req.params.appointmentId
    );
    if (!deleted) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
