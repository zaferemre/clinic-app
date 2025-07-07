import { RequestHandler } from "express";
import * as clinicService from "../services/clinicService";
import jwt from "jsonwebtoken";
// List all clinics in a company
export const listClinics: RequestHandler = async (req, res, next) => {
  try {
    const clinics = await clinicService.listClinics(req.params.companyId);
    res.json(clinics);
  } catch (err) {
    next(err);
  }
};

// Create new clinic in company
export const createClinic: RequestHandler = async (req, res, next) => {
  try {
    // 🟢 Get current user's uid from auth middleware
    const uid = (req.user as any)?.uid;
    const clinic = await clinicService.createClinic(
      req.params.companyId,
      req.body,
      uid // Pass user id to service
    );
    res.status(201).json(clinic);
  } catch (err) {
    next(err);
  }
};

// Get clinic
export const getClinic: RequestHandler = async (req, res, next) => {
  try {
    const clinic = await clinicService.getClinicById(
      req.params.companyId,
      req.params.clinicId
    );
    res.json(clinic);
  } catch (err) {
    next(err);
  }
};

// Update clinic
export const updateClinic: RequestHandler = async (req, res, next) => {
  try {
    const updated = await clinicService.updateClinic(
      req.params.clinicId,
      req.body
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Delete clinic
export const deleteClinic: RequestHandler = async (req, res, next) => {
  try {
    await clinicService.deleteClinic(req.params.clinicId);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
export { getClinic as getClinicById } from "./clinicController";

const JWT_SECRET = process.env.QR_TOKEN_SECRET ?? "supersecret";

// QR token üret
export const getQrToken: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId } = req.params;
    // İstediğin claimleri koyabilirsin
    const token = jwt.sign(
      { companyId, clinicId, ts: Date.now() },
      JWT_SECRET,
      { expiresIn: "2h" }
    );
    res.json({ token });
  } catch (err) {
    next(err);
  }
};
