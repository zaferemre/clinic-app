// src/routes/messageRoutes.ts

import express from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeCompanyAccess } from "../middlewares/authorizeCompanyAccess";
import Message from "../models/Message";

const router = express.Router();

/**
 * GET /Company/:companyId/messages
 * List all pending or sent messages for this Company.
 */
router.get(
  "/:companyId/messages",
  verifyFirebaseToken,
  authorizeCompanyAccess,
  async (req, res): Promise<void> => {
    const companyId = req.params.companyId;
    try {
      const msgs = await Message.find({ companyId }).sort({ scheduledFor: -1 });
      res.json(msgs);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      res.status(500).json({ error: "Failed to fetch messages." });
    }
  }
);

/**
 * POST /Company/:companyId/messages/patient/:patientId
 * Schedule a single‐patient message.
 */
router.post(
  "/:companyId/messages/patient/:patientId",
  verifyFirebaseToken,
  authorizeCompanyAccess,
  async (req, res): Promise<void> => {
    const { companyId, patientId } = req.params;
    const { text, scheduledFor } = req.body;
    try {
      const msg = new Message({
        companyId,
        patientId,
        text,
        scheduledFor: new Date(scheduledFor),
      });
      await msg.save();
      res.status(201).json(msg);
    } catch (err: any) {
      console.error("Error scheduling single patient message:", err);
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * POST /Company/:companyId/messages/bulk
 * Schedule a bulk message to all patients.
 */
router.post(
  "/:companyId/messages/bulk",
  verifyFirebaseToken,
  authorizeCompanyAccess,
  async (req, res): Promise<void> => {
    const companyId = req.params.companyId;
    const { text, scheduledFor } = req.body;
    try {
      const msg = new Message({
        companyId,
        text,
        scheduledFor: new Date(scheduledFor),
      });
      await msg.save();
      res.status(201).json(msg);
    } catch (err: any) {
      console.error("Error scheduling bulk message:", err);
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * POST /Company/:companyId/messages/auto-remind
 * Record an auto‐reminder offset (in hours) for the Company.
 * The backend should save offsetHours so that a background worker
 * can send WhatsApp reminders offsetHours before each appointment.
 */
router.post(
  "/:companyId/messages/auto-remind",
  verifyFirebaseToken,
  authorizeCompanyAccess,
  async (req, res): Promise<void> => {
    const { companyId } = req.params;
    const { offsetHours } = req.body as { offsetHours?: number };

    // Validate
    if (typeof offsetHours !== "number" || offsetHours < 1) {
      res.status(400).json({ error: "Geçerli bir saat aralığı girin." });
      return;
    }

    try {
      // Here you would update your Company model, e.g.:
      // await Company.findByIdAndUpdate(companyId, { autoRemindOffsetHours: offsetHours });
      // For now, just return success:
      res
        .status(200)
        .json({ message: "Otomatik hatırlatma kaydedildi.", offsetHours });
    } catch (err: any) {
      console.error("Error saving auto-remind setting:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);

export default router;
