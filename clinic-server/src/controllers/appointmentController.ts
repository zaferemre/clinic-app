import { RequestHandler } from "express";
import * as appointmentService from "../services/appointmentService";

// List all appointments
export const listAppointments: RequestHandler = async (req, res, next) => {
  try {
    const filters: any = {};
    if (req.query.employeeId) filters.employeeId = req.query.employeeId;
    if (req.query.patientId) filters.patientId = req.query.patientId;
    if (req.query.groupId) filters.groupId = req.query.groupId;

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

// Get a single appointment
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

// Create new appointment
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
      req.body, // contains employeeId = Firebase UID
      uid
    );
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

// Update appointment
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

// Delete appointment
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

/**
 * List all appointments across all companies/clinics for a given user.
 * Route: GET /api/appointments/user/:userId
 */
export const listAppointmentsByUser: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const uid = (req.user as any).uid;
    const appointments = await appointmentService.getAppointmentsByUser(uid);
    res.json(appointments);
  } catch (err) {
    next(err);
  }
};
