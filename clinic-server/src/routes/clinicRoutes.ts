import { Router, Request, Response, NextFunction } from "express";
import Clinic from "../models/Clinic";

const router = Router();

// GET /clinic/by-email
router.get(
  "/by-email",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerEmail = (req as any).user?.email as string | undefined;
      if (!ownerEmail) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const clinic = await Clinic.findOne({
        $or: [{ ownerEmail: ownerEmail }, { workers: ownerEmail }],
      }).exec();

      if (!clinic) {
        res.status(404).json({ error: "No clinic for this user" });
        return;
      }

      res.status(200).json(clinic);
      return;
    } catch (err: any) {
      console.error("Error in GET /clinic/by-email:", err);
      res.status(500).json({ error: "Server error", details: err.message });
      return;
    }
  }
);

// POST /clinic/new
router.post("/new", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ownerEmail = (req as any).user?.email as string | undefined;
    if (!ownerEmail) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const { name } = req.body as { name?: string };
    if (!name || !name.trim()) {
      res.status(400).json({ error: "Clinic name is required" });
      return;
    }

    const existing = await Clinic.findOne({ ownerEmail }).exec();
    if (existing) {
      res
        .status(409)
        .json({ error: "You already have a clinic", clinic: existing });
      return;
    }

    const newClinic = new Clinic({
      name: name.trim(),
      ownerEmail,
      workers: [],
    });
    const saved = await newClinic.save();
    res.status(201).json(saved);
    return;
  } catch (err: any) {
    console.error("⚠️ Error in POST /clinic/new:", err);
    res
      .status(500)
      .json({ error: "Failed to create clinic", details: err.message });
    return;
  }
});

// ——— NEW ROUTE ADDED HERE ———
// GET /clinic/:clinicId
router.get(
  "/:clinicId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { clinicId } = req.params;
      const clinic = await Clinic.findById(clinicId).exec();
      if (!clinic) {
        res.status(404).json({ error: "Clinic not found" });
        return;
      }
      res.status(200).json(clinic);
      return;
    } catch (err: any) {
      console.error("Error in GET /clinic/:clinicId:", err);
      res.status(500).json({ error: "Server error", details: err.message });
      return;
    }
  }
);

export default router;
