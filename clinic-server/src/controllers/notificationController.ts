import { RequestHandler } from "express";
import * as notificationService from "../services/notificationService";

// Create notification
export const createNotification: RequestHandler = async (req, res, next) => {
  try {
    const notif = await notificationService.createNotification(
      req.params.companyId,
      req.params.clinicId,
      req.body
    );
    res.status(201).json(notif);
  } catch (err) {
    next(err);
  }
};

// List notifications for a company & clinic
export const listNotifications: RequestHandler = async (req, res, next) => {
  try {
    const notifications = await notificationService.listNotifications(
      req.params.companyId,
      req.params.clinicId
    );
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

// Mark a notification as done
export const markNotificationDone: RequestHandler = async (req, res, next) => {
  try {
    const updated = await notificationService.markNotificationDone(
      req.params.companyId,
      req.params.clinicId,
      req.params.notificationId
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
