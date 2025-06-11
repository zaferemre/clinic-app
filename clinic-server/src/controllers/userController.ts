// src/controllers/userController.ts
import { RequestHandler } from "express";
import Company from "../models/Company";
import admin from "firebase-admin";

export const deleteUserAccount: RequestHandler = async (req, res, next) => {
  try {
    const email = req.user!.email;
    // Remove them from every company’s employee list
    await Company.updateMany({}, { $pull: { employees: { email } } });
    // If you’re using Firebase Auth, also delete the user record:
    if (req.user!.uid) {
      await admin.auth().deleteUser(req.user!.uid);
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
