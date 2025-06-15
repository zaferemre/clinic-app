import { Request, Response, NextFunction } from "express";
import * as appointmentService from "../services/appointmentService";
import { IUser } from "../thirdParty/firebaseAdminService";

export const getAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const events = await appointmentService.getAppointments(
      req.params.companyId
    );
    res.status(200).json(events);
  } catch (err) {
    next(err);
  }
};

export const getAppointmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dto = await appointmentService.getAppointmentById(
      req.params.companyId,
      req.params.appointmentId
    );
    res.status(200).json(dto);
  } catch (err) {
    next(err);
  }
};

export const createAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const created = await appointmentService.createAppointment(
      req.params.companyId,
      req.body,
      req.user as IUser
    );
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

export const updateAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await appointmentService.updateAppointment(
      req.params.companyId,
      req.params.appointmentId,
      req.body
    );
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await appointmentService.deleteAppointment(
      req.params.companyId,
      req.params.appointmentId
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
