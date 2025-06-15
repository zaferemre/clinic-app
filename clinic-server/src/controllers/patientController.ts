import { Request, Response, NextFunction } from "express";
import * as patientService from "../services/patientService";
import { IUser } from "../thirdParty/firebaseAdminService";

export const createPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pat = await patientService.createPatient(
      req.params.companyId,
      req.body
    );
    res.status(201).json(pat);
  } catch (err) {
    next(err);
  }
};

export const getPatients = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const list = await patientService.getPatients(req.params.companyId);
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
};

// ← new handler
export const getPatientById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pat = await patientService.getPatientById(
      req.params.companyId,
      req.params.patientId!
    );
    res.status(200).json(pat);
  } catch (err) {
    next(err);
  }
};

export const updatePatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await patientService.updatePatient(
      req.params.companyId,
      req.params.patientId!,
      req.body
    );
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const recordPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await patientService.recordPayment(
      req.params.companyId,
      req.params.patientId!,
      req.body
    );
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const getPatientAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const appts = await patientService.getPatientAppointments(
      req.params.companyId,
      req.params.patientId!
    );
    res.status(200).json(appts);
  } catch (err) {
    next(err);
  }
};

export const flagPatientCall = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const notif = await patientService.flagPatientCall(
      req.params.companyId,
      req.params.patientId!,
      req.body.note,
      (req.user as IUser).email
    );
    res.status(201).json(notif);
  } catch (err) {
    next(err);
  }
};

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const list = await patientService.getNotifications(req.params.companyId);
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
};

export const markPatientCalled = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await patientService.markPatientCalled(
      req.params.companyId,
      req.params.notificationId!
    );
    res.status(200).json({ message: "Notification marked done" });
  } catch (err) {
    next(err);
  }
};

export const deletePatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await patientService.deletePatient(
      req.params.companyId,
      req.params.patientId!
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
