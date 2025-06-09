"use strict";
// src/routes/messageRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyFirebaseToken_1 = require("../middlewares/verifyFirebaseToken");
const authorizeCompanyAccess_1 = require("../middlewares/authorizeCompanyAccess");
const Message_1 = __importDefault(require("../models/Message"));
const router = express_1.default.Router();
/**
 * GET /Company/:companyId/messages
 * List all pending or sent messages for this Company.
 */
router.get("/:companyId/messages", verifyFirebaseToken_1.verifyFirebaseToken, authorizeCompanyAccess_1.authorizeCompanyAccess, async (req, res) => {
    const companyId = req.params.companyId;
    try {
        const msgs = await Message_1.default.find({ companyId }).sort({ scheduledFor: -1 });
        res.json(msgs);
    }
    catch (err) {
        console.error("Failed to fetch messages:", err);
        res.status(500).json({ error: "Failed to fetch messages." });
    }
});
/**
 * POST /Company/:companyId/messages/patient/:patientId
 * Schedule a single‐patient message.
 */
router.post("/:companyId/messages/patient/:patientId", verifyFirebaseToken_1.verifyFirebaseToken, authorizeCompanyAccess_1.authorizeCompanyAccess, async (req, res) => {
    const { companyId, patientId } = req.params;
    const { text, scheduledFor } = req.body;
    try {
        const msg = new Message_1.default({
            companyId,
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
 * POST /Company/:companyId/messages/bulk
 * Schedule a bulk message to all patients.
 */
router.post("/:companyId/messages/bulk", verifyFirebaseToken_1.verifyFirebaseToken, authorizeCompanyAccess_1.authorizeCompanyAccess, async (req, res) => {
    const companyId = req.params.companyId;
    const { text, scheduledFor } = req.body;
    try {
        const msg = new Message_1.default({
            companyId,
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
 * POST /Company/:companyId/messages/auto-remind
 * Record an auto‐reminder offset (in hours) for the Company.
 * The backend should save offsetHours so that a background worker
 * can send WhatsApp reminders offsetHours before each appointment.
 */
router.post("/:companyId/messages/auto-remind", verifyFirebaseToken_1.verifyFirebaseToken, authorizeCompanyAccess_1.authorizeCompanyAccess, async (req, res) => {
    const { companyId } = req.params;
    const { offsetHours } = req.body;
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
    }
    catch (err) {
        console.error("Error saving auto-remind setting:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});
exports.default = router;
