// src/controllers/selfRegisterController.ts

import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import * as patientService from "../services/patientService";
import * as notificationService from "../services/notificationService"; // EKLENDİ
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

    // Hasta oluştur
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

    // === Klinik çalışanlarına bildirimi yolla ===
    await notificationService.createNotification(companyId, clinicId, {
      type: "system",
      status: "sent",
      title: "Yeni Müşteri Kaydı",
      message: `Yeni müşteri kendi kaydını oluşturdu: ${name}`,
      note: "Müşteriyi düzenlemeyi unutma! Bu kayıt QR ile hasta tarafından yapıldı.",
      priority: "normal",
      patientId:
        typeof created._id === "string" ? created._id : String(created._id),
      meta: {
        phone,
        email,
        registeredVia: "self-register",
      },
    });

    res.status(201).json({ ok: true, patientId: created._id });
  } catch (err) {
    next(err);
  }
};
