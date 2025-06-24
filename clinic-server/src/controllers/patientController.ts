import { RequestHandler } from "express";
import * as patientService from "../services/patientService";

// List all patients in clinic
export const listPatients: RequestHandler = async (req, res, next) => {
  try {
    const patients = await patientService.getPatients(
      req.params.companyId,
      req.params.clinicId
    );
    res.json(patients);
  } catch (err) {
    next(err);
  }
};

// Create patient
export const createPatient: RequestHandler = async (req, res, next) => {
  try {
    const patient = await patientService.createPatient(
      req.params.companyId,
      req.params.clinicId,
      req.body
    );
    res.status(201).json(patient);
  } catch (err) {
    next(err);
  }
};

// Get one patient
export const getPatient: RequestHandler = async (req, res, next) => {
  try {
    const patient = await patientService.getPatientById(
      req.params.companyId,
      req.params.clinicId,
      req.params.patientId
    );
    res.json(patient);
  } catch (err) {
    next(err);
  }
};

// Update patient
export const updatePatient: RequestHandler = async (req, res, next) => {
  try {
    const updated = await patientService.updatePatient(
      req.params.companyId,
      req.params.clinicId,
      req.params.patientId,
      req.body
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Delete patient
export const deletePatient: RequestHandler = async (req, res, next) => {
  try {
    await patientService.deletePatient(
      req.params.companyId,
      req.params.clinicId,
      req.params.patientId
    );
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

// Record payment for patient
export const recordPayment: RequestHandler = async (req, res, next) => {
  try {
    const record = await patientService.recordPayment(
      req.params.companyId,
      req.params.clinicId,
      req.params.patientId,
      req.body
    );
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
};

export { getPatient as getPatientById };

// --- NEW/COMPLETE:
export const getPatientAppointments: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const appts = await patientService.getPatientAppointments(
      req.params.companyId,
      req.params.clinicId,
      req.params.patientId
    );
    res.json(appts);
  } catch (err) {
    next(err);
  }
};

export const flagPatientCall: RequestHandler = async (req, res, next) => {
  try {
    const flagged = await patientService.flagPatientCall(
      req.params.companyId,
      req.params.clinicId,
      req.params.patientId,
      req.body.flagType ?? "called"
    );
    res.json(flagged);
  } catch (err) {
    next(err);
  }
};
