import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import * as patientService from "../services/patientService";
import Clinic from "../models/Clinic";
import createError from "http-errors";

if (!process.env.QR_TOKEN_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("QR_TOKEN_SECRET must be set in production!");
}

const JWT_SECRET = process.env.QR_TOKEN_SECRET ?? "supersecret";

export const selfRegisterPatient: RequestHandler = async (req, res, next) => {
  const { companyId, clinicId, token } = req.params;
  const { name, phone, email, kvkkAccepted, clinicKvkkAccepted } = req.body;

  try {
    // Token doğrulama
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.companyId !== companyId || payload.clinicId !== clinicId) {
      throw createError(403, "Token/URL mismatch");
    }
    // Klinik KVKK’yı çek
    const clinic = await Clinic.findById(clinicId);

    if (!kvkkAccepted) throw createError(400, "KVKK zorunlu");

    if (clinic?.kvkkRequired && !clinicKvkkAccepted) {
      throw createError(400, "Klinik sözleşmesi zorunlu");
    }

    const created = await patientService.createPatient(companyId, clinicId, {
      name,
      phone,
      email,
      kvkkAccepted: true,
      kvkkAcceptedAt: new Date(),
      clinicKvkkAccepted: clinicKvkkAccepted ?? false,
      clinicKvkkAcceptedAt: clinicKvkkAccepted ? new Date() : undefined,
      clinicKvkkVersionAtAccept: clinic?.kvkkLastSetAt,
    });

    res.status(201).json({ ok: true, patientId: created._id });
  } catch (err) {
    next(err);
  }
};
