import { Request, Response, NextFunction } from "express";
import * as notifService from "../services/notificationService";

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const list = await notifService.getNotifications(req.params.companyId);
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
    await notifService.markPatientCalled(
      req.params.companyId,
      req.params.notificationId
    );
    res.status(200).json({ message: "Notification marked done" });
  } catch (err) {
    next(err);
  }
};
