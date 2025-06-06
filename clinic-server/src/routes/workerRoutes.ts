// src/routes/workerRoutes.ts
import express, { Request, Response } from "express";
import Worker from "../models/Worker";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeClinicAccess } from "../middlewares/authorizeClinicAccess";

const router = express.Router();

// GET all workers for a clinic
router.get(
  "/:clinicId/workers",
  verifyFirebaseToken,
  authorizeClinicAccess,
  async (req: Request, res: Response): Promise<void> => {
    const { clinicId } = req.params;
    try {
      const workers = await Worker.find({ clinicId }).exec();
      res.json(workers);
      return;
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch workers." });
      return;
    }
  }
);

// POST create a new worker
router.post(
  "/:clinicId/workers",
  async (req: Request, res: Response): Promise<void> => {
    const { clinicId } = req.params;
    const { name, email, role, availability } = req.body;
    try {
      const newWorker = new Worker({
        name,
        email,
        role,
        availability,
        clinicId,
      });
      await newWorker.save();
      res.status(201).json(newWorker);
      return;
    } catch (err: any) {
      res.status(400).json({ error: err.message });
      return;
    }
  }
);

// PATCH update a worker
router.patch(
  "/workers/:workerId",
  async (req: Request, res: Response): Promise<void> => {
    const { workerId } = req.params;
    try {
      const updated = await Worker.findByIdAndUpdate(workerId, req.body, {
        new: true,
      });
      if (!updated) {
        res.status(404).json({ error: "Worker not found" });
        return;
      }
      res.json(updated);
      return;
    } catch (err) {
      res.status(500).json({ error: "Failed to update worker." });
      return;
    }
  }
);

// DELETE a worker
router.delete(
  "/workers/:workerId",
  async (req: Request, res: Response): Promise<void> => {
    const { workerId } = req.params;
    try {
      await Worker.findByIdAndDelete(workerId);
      res.json({ success: true });
      return;
    } catch (err) {
      res.status(500).json({ error: "Failed to delete worker." });
      return;
    }
  }
);

export default router;
