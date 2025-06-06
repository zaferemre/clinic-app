"use strict";
// src/routes/messageRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyFirebaseToken_1 = require("../middlewares/verifyFirebaseToken");
const authorizeClinicAccess_1 = require("../middlewares/authorizeClinicAccess");
const Message_1 = __importDefault(require("../models/Message"));
const router = express_1.default.Router();
/**
 * GET /clinic/:clinicId/messages
 * List all pending or sent messages for this clinic.
 */
router.get("/:clinicId/messages", verifyFirebaseToken_1.verifyFirebaseToken, authorizeClinicAccess_1.authorizeClinicAccess, async (req, res) => {
    const clinicId = req.params.clinicId;
    try {
        const msgs = await Message_1.default.find({ clinicId }).sort({ scheduledFor: -1 });
        res.json(msgs);
    }
    catch (err) {
        console.error("Failed to fetch messages:", err);
        res.status(500).json({ error: "Failed to fetch messages." });
    }
});
/**
 * POST /clinic/:clinicId/messages/patient/:patientId
 * Schedule a single‐patient message.
 */
router.post("/:clinicId/messages/patient/:patientId", verifyFirebaseToken_1.verifyFirebaseToken, authorizeClinicAccess_1.authorizeClinicAccess, async (req, res) => {
    const { clinicId, patientId } = req.params;
    const { text, scheduledFor } = req.body;
    try {
        const msg = new Message_1.default({
            clinicId,
            patientId,
            text,
            scheduledFor: new Date(scheduledFor),
        });
        await msg.save();
        res.status(201).json(msg);
    }
    catch (err) {
        console.error("Error scheduling single patient message:", err);
        res.status(400).json({ error: err.message });
    }
});
/**
 * POST /clinic/:clinicId/messages/bulk
 * Schedule a bulk message to all patients.
 */
router.post("/:clinicId/messages/bulk", verifyFirebaseToken_1.verifyFirebaseToken, authorizeClinicAccess_1.authorizeClinicAccess, async (req, res) => {
    const clinicId = req.params.clinicId;
    const { text, scheduledFor } = req.body;
    try {
        const msg = new Message_1.default({
            clinicId,
            text,
            scheduledFor: new Date(scheduledFor),
        });
        await msg.save();
        res.status(201).json(msg);
    }
    catch (err) {
        console.error("Error scheduling bulk message:", err);
        res.status(400).json({ error: err.message });
    }
});
/**
 * POST /clinic/:clinicId/messages/auto-remind
 * Record an auto‐reminder offset (in hours) for the clinic.
 * The backend should save offsetHours so that a background worker
 * can send WhatsApp reminders offsetHours before each appointment.
 */
router.post("/:clinicId/messages/auto-remind", verifyFirebaseToken_1.verifyFirebaseToken, authorizeClinicAccess_1.authorizeClinicAccess, async (req, res) => {
    const { clinicId } = req.params;
    const { offsetHours } = req.body;
    // Validate
    if (typeof offsetHours !== "number" || offsetHours < 1) {
        res.status(400).json({ error: "Geçerli bir saat aralığı girin." });
        return;
    }
    try {
        // Here you would update your Clinic model, e.g.:
        // await Clinic.findByIdAndUpdate(clinicId, { autoRemindOffsetHours: offsetHours });
        // For now, just return success:
        res
            .status(200)
            .json({ message: "Otomatik hatırlatma kaydedildi.", offsetHours });
    }
    catch (err) {
        console.error("Error saving auto-remind setting:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});
exports.default = router;
