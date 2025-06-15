import express from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeCompanyAccess } from "../middlewares/authorizeCompanyAccess";
import Message from "../models/Message";

const router = express.Router();

// require token + access for any :companyId
router.use("/:companyId", verifyFirebaseToken, authorizeCompanyAccess);

// List all scheduled messages
router.get("/:companyId/messages", async (req, res) => {
  try {
    const msgs = await Message.find({ companyId: req.params.companyId }).sort({
      scheduledFor: -1,
    });
    res.json(msgs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
});

// Schedule single‐patient message
router.post("/:companyId/messages/patient/:patientId", async (req, res) => {
  try {
    const { text, scheduledFor } = req.body;
    const msg = new Message({
      companyId: req.params.companyId,
      patientId: req.params.patientId,
      text,
      scheduledFor: new Date(scheduledFor),
    });
    await msg.save();
    res.status(201).json(msg);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Schedule bulk message
router.post("/:companyId/messages/bulk", async (req, res) => {
  try {
    const { text, scheduledFor } = req.body;
    const msg = new Message({
      companyId: req.params.companyId,
      text,
      scheduledFor: new Date(scheduledFor),
    });
    await msg.save();
    res.status(201).json(msg);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});
