// src/controllers/userController.ts
import { RequestHandler } from "express";
import Company from "../models/Company";
import admin from "firebase-admin";

// DELETE /company/user
export const deleteUserAccount: RequestHandler = async (req, res, next) => {
  try {
    const email = (req.user as any).email as string;
    const uid = (req.user as any).uid as string;

    // Remove from all companies
    await Company.updateMany(
      { employees: email },
      { $pull: { employees: email } }
    );

    // Delete from Firebase
    await admin.auth().deleteUser(uid);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
