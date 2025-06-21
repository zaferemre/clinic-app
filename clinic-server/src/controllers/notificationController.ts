// src/controllers/notificationController.ts
import { RequestHandler } from "express";
import * as notifService from "../services/notificationService";

export const getNotifications: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId } = req.params as {
      companyId: string;
      clinicId: string;
    };
    const notifications = await notifService.listNotifications(
      companyId,
      clinicId
    );
    res.status(200).json(notifications);
  } catch (err) {
    next(err);
  }
};

export const markNotificationDone: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId, notificationId } = req.params as {
      companyId: string;
      clinicId: string;
      notificationId: string;
    };
    await notifService.markNotificationDone(
      companyId,
      clinicId,
      notificationId
    );
    res.status(200).json({ message: "Notification marked done" });
  } catch (err) {
    next(err);
  }
};
