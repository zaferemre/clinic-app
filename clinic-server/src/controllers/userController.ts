import { RequestHandler } from "express";
import * as userService from "../services/userService";

// POST /user/register
export const registerUser: RequestHandler = async (req, res, next) => {
  try {
    const uid = (req.user as any).uid;
    const { email, name, photoUrl } = req.body;

    // service will throw if name missing
    const user = await userService.registerUser(uid, { email, name, photoUrl });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

// GET /user/me — only returns if already registered
export const getMe: RequestHandler = async (req, res, next) => {
  try {
    const uid = (req.user as any).uid;
    const user = await userService.getUserProfile(uid);

    // If userService returns null/undefined, treat as "not found"
    if (!user) {
      // Option 1: return 404
      res.status(404).json({ message: "User not found" });
      return;

      // Option 2 (less common): return 500
      // res.status(500).json({ message: "User not registered" });
      // return;
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
export const deleteUserAccount: RequestHandler = async (_req, res, next) => {
  try {
    const uid = (_req.user as any).uid;
    await userService.deleteUser(uid);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

// List companies, clinics, leave membership omitted for brevity
export const listUserCompanies: RequestHandler = async (req, res, next) => {
  try {
    const uid = (req.user as any).uid;
    const companies = await userService.getUserMemberships(uid);
    res.json(companies);
  } catch (err) {
    next(err);
  }
};
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
    const user = await userService.addUserMembership(uid, membership);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
