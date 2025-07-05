// src/controllers/userController.ts

import { RequestHandler } from "express";
import * as userService from "../services/userService";

// POST /user/register
export const registerUser: RequestHandler = async (req, res, next) => {
  try {
    const uid = (req.user as any).uid;
    const { email, name, photoUrl } = req.body;
    const user = await userService.registerUser(uid, { email, name, photoUrl });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

// GET /user/me
export const getMe: RequestHandler = async (req, res, next) => {
  try {
    const uid = (req.user as any).uid;
    const user = await userService.getUserProfile(uid);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// PATCH /user/me
export const updateMe: RequestHandler = async (req, res, next) => {
  try {
    const uid = (req.user as any).uid;
    const user = await userService.updateUserSettings(uid, req.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// DELETE /user/me
export const deleteUserAccount: RequestHandler = async (req, res, next) => {
  try {
    const uid = (req.user as any).uid;
    await userService.deleteUser(uid);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

// GET /user/companies
export const listUserCompanies: RequestHandler = async (req, res, next) => {
  try {
    const uid = (req.user as any).uid;
    const companies = await userService.getUserMemberships(uid);
    res.json(companies);
  } catch (err) {
    next(err);
  }
};

// GET /user/clinics
export const listUserClinics: RequestHandler = async (req, res, next) => {
  try {
    const uid = (req.user as any).uid;
    const clinics = await userService.getUserClinics(uid);
    res.json(clinics);
  } catch (err) {
    next(err);
  }
};

// POST /user/membership
export const addMembership: RequestHandler = async (req, res, next) => {
  try {
    const uid = (req.user as any).uid;
    const { companyId, companyName, clinicId, clinicName, roles } = req.body;
    if (!companyId || !companyName) {
      res.status(400).json({ message: "companyId and companyName required" });
      return;
    }
    const membership = { companyId, companyName, clinicId, clinicName, roles };
    // Return FRESH memberships immediately after mutation!
    const memberships = await userService.addUserMembership(uid, membership);
    res.status(200).json(memberships);
  } catch (err) {
    next(err);
  }
};

// GET /user/appointments
export const listAllAppointmentsForMe: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const uid = (req.user as any)?.uid;
    if (!uid) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const appointments = await userService.getAllAppointmentsForUser(uid);
    res.json(appointments);
  } catch (err) {
    next(err);
  }
};

// --- PUSH TOKEN ENDPOINTLERİ ---

export const addPushToken: RequestHandler = async (req, res, next) => {
  try {
    const uid = req.params.uid || (req.user as any)?.uid;
    const { token } = req.body;
    if (!uid) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!token) {
      res.status(400).json({ error: "Token is required" });
      return;
    }
    const user = await userService.addUserPushToken(uid, token);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ pushTokens: user.pushTokens });
  } catch (err) {
    next(err);
  }
};

export const removePushToken: RequestHandler = async (req, res, next) => {
  try {
    const uid = req.params.uid || (req.user as any)?.uid;
    const { token } = req.body;
    if (!uid) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!token) {
      res.status(400).json({ error: "Token is required" });
      return;
    }
    const user = await userService.removeUserPushToken(uid, token);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ pushTokens: user.pushTokens });
  } catch (err) {
    next(err);
  }
};

export const setPushTokens: RequestHandler = async (req, res, next) => {
  try {
    const uid = req.params.uid || (req.user as any)?.uid;
    const { tokens } = req.body;
    if (!uid) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!Array.isArray(tokens)) {
      res.status(400).json({ error: "Tokens must be array" });
      return;
    }
    const user = await userService.setUserPushTokens(uid, tokens);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ pushTokens: user.pushTokens });
  } catch (err) {
    next(err);
  }
};

export const getPushTokens: RequestHandler = async (req, res, next) => {
  try {
    const uid = req.params.uid || (req.user as any)?.uid;
    if (!uid) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const tokens = await userService.getUserPushTokens(uid);
    if (!tokens) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ pushTokens: tokens });
  } catch (err) {
    next(err);
  }
};
