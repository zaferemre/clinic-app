// src/controllers/patientController.ts
import { RequestHandler } from "express";
import * as patientService from "../services/patientService";
import mongoose from "mongoose";
import Employee from "../models/Employee";

export const createPatient: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId } = req.params as {
      companyId: string;
      clinicId: string;
    };
    const created = await patientService.createPatient(
      companyId,
      clinicId,
      req.body
    );
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

export const listPatients: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId } = req.params as {
      companyId: string;
      clinicId: string;
    };
    const patients = await patientService.getPatients(companyId, clinicId);
    res.status(200).json(patients);
  } catch (err) {
    next(err);
  }
};

export const getPatientById: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId, patientId } = req.params as {
      companyId: string;
      clinicId: string;
      patientId: string;
    };
    const patient = await patientService.getPatientById(
      companyId,
      clinicId,
      patientId
    );
    res.status(200).json(patient);
  } catch (err) {
    next(err);
  }
};

export const updatePatient: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId, patientId } = req.params as {
      companyId: string;
      clinicId: string;
      patientId: string;
    };
    const updated = await patientService.updatePatient(
      companyId,
      clinicId,
      patientId,
      req.body
    );
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const recordPayment: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId, patientId } = req.params as {
      companyId: string;
      clinicId: string;
      patientId: string;
    };
    const record = await patientService.recordPayment(
      companyId,
      clinicId,
      patientId,
      req.body
    );
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
};

export const getPatientAppointments: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { companyId, clinicId, patientId } = req.params as {
      companyId: string;
      clinicId: string;
      patientId: string;
    };
    const appts = await patientService.getPatientAppointments(
      companyId,
      clinicId,
      patientId
    );
    res.status(200).json(appts);
  } catch (err) {
    next(err);
  }
};

export const flagPatientCall: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId, patientId } = req.params as {
      companyId: string;
      clinicId: string;
      patientId: string;
    };
    const { note } = req.body as { note: string };
    const firebaseUid = (req as any).user?.uid as string;

    const emp = await Employee.findOne({
      userId: firebaseUid,
      companyId: new mongoose.Types.ObjectId(companyId),
      clinicId: new mongoose.Types.ObjectId(clinicId),
    }).exec();

    if (!emp) {
      res
        .status(404)
        .json({ error: "Employee not found for current user and clinic" });
      return;
    }

    const notif = await patientService.flagPatientCall(
      companyId,
      clinicId,
      patientId,
      note,
      (emp._id as mongoose.Types.ObjectId).toString()
    );
    res.status(201).json(notif);
  } catch (err) {
    next(err);
  }
};

export const deletePatient: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId, patientId } = req.params as {
      companyId: string;
      clinicId: string;
      patientId: string;
    };
    await patientService.deletePatient(companyId, clinicId, patientId);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
