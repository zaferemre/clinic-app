"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/workerRoutes.ts
const express_1 = __importDefault(require("express"));
const Worker_1 = __importDefault(require("../models/Worker"));
const verifyFirebaseToken_1 = require("../middlewares/verifyFirebaseToken");
const authorizeClinicAccess_1 = require("../middlewares/authorizeClinicAccess");
const router = express_1.default.Router();
// GET all workers for a clinic
router.get("/:clinicId/workers", verifyFirebaseToken_1.verifyFirebaseToken, authorizeClinicAccess_1.authorizeClinicAccess, async (req, res) => {
    const { clinicId } = req.params;
    try {
        const workers = await Worker_1.default.find({ clinicId }).exec();
        res.json(workers);
        return;
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch workers." });
        return;
    }
});
// POST create a new worker
router.post("/:clinicId/workers", async (req, res) => {
    const { clinicId } = req.params;
    const { name, email, role, availability } = req.body;
    try {
        const newWorker = new Worker_1.default({
            name,
            email,
            role,
            availability,
            clinicId,
        });
        await newWorker.save();
        res.status(201).json(newWorker);
        return;
    }
    catch (err) {
        res.status(400).json({ error: err.message });
        return;
    }
});
// PATCH update a worker
router.patch("/workers/:workerId", async (req, res) => {
    const { workerId } = req.params;
    try {
        const updated = await Worker_1.default.findByIdAndUpdate(workerId, req.body, {
            new: true,
        });
        if (!updated) {
            res.status(404).json({ error: "Worker not found" });
            return;
        }
        res.json(updated);
        return;
    }
    catch (err) {
        res.status(500).json({ error: "Failed to update worker." });
        return;
    }
});
// DELETE a worker
router.delete("/workers/:workerId", async (req, res) => {
    const { workerId } = req.params;
    try {
        await Worker_1.default.findByIdAndDelete(workerId);
        res.json({ success: true });
        return;
    }
    catch (err) {
        res.status(500).json({ error: "Failed to delete worker." });
        return;
    }
});
exports.default = router;
