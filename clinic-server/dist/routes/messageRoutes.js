"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyFirebaseToken_1 = require("../middlewares/verifyFirebaseToken");
const authorizeCompanyAccess_1 = require("../middlewares/authorizeCompanyAccess");
const Message_1 = __importDefault(require("../models/Message"));
const router = express_1.default.Router();
// require token + access for any :companyId
router.use("/:companyId", verifyFirebaseToken_1.verifyFirebaseToken, authorizeCompanyAccess_1.authorizeCompanyAccess);
// List all scheduled messages
router.get("/:companyId/messages", async (req, res) => {
    try {
        const msgs = await Message_1.default.find({ companyId: req.params.companyId }).sort({
            scheduledFor: -1,
        });
        res.json(msgs);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch messages." });
    }
});
// Schedule single‐patient message
router.post("/:companyId/messages/patient/:patientId", async (req, res) => {
    try {
        const { text, scheduledFor } = req.body;
        const msg = new Message_1.default({
            companyId: req.params.companyId,
            patientId: req.params.patientId,
            text,
            scheduledFor: new Date(scheduledFor),
        });
        await msg.save();
        res.status(201).json(msg);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});
// Schedule bulk message
router.post("/:companyId/messages/bulk", async (req, res) => {
    try {
        const { text, scheduledFor } = req.body;
        const msg = new Message_1.default({
            companyId: req.params.companyId,
            text,
            scheduledFor: new Date(scheduledFor),
        });
        await msg.save();
        res.status(201).json(msg);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});
exports.default = router;
