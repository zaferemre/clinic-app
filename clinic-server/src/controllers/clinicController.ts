// src/controllers/clinicController.ts

import { Request, Response, NextFunction } from "express";
import { RequestHandler } from "express-serve-static-core";
import Clinic from "../models/Clinic";
import { admin } from "../config/firebase";

// ────────────────────────────────────────────────────────────────────────────
// Define a local TypeScript type for the worker subdocument so that 'w' is never implicitly `any`.
// (Adjust this if your Mongoose schema has slightly different field names or types.)
type WorkerSubdoc = {
  email: string;
  name: string;
  role: string;
  pictureUrl?: string;
};

// ────────────────────────────────────────────────────────────────────────────
// 1) getClinicByEmail
// ────────────────────────────────────────────────────────────────────────────
export const getClinicByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerEmail = (req as any).user?.email as string | undefined;
    if (!ownerEmail) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const clinic = await Clinic.findOne({
      $or: [{ ownerEmail: ownerEmail }, { "workers.email": ownerEmail }],
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
};

// ────────────────────────────────────────────────────────────────────────────
// 2) createClinic
// ────────────────────────────────────────────────────────────────────────────
export const createClinic = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerEmail = (req as any).user?.email as string | undefined;
    if (!ownerEmail) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const { name } = req.body as { name?: string };
    if (!name?.trim()) {
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
};

// ────────────────────────────────────────────────────────────────────────────
// 3) getClinicById
// ────────────────────────────────────────────────────────────────────────────
export const getClinicById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
};

// ────────────────────────────────────────────────────────────────────────────
// 4) addWorker (owner-only)
// ────────────────────────────────────────────────────────────────────────────
export const addWorker: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { clinicId } = req.params;
    const { email } = req.body as { email?: string };
    if (!email?.trim()) {
      res.status(400).json({ error: "Worker email is required" });
      return;
    }

    const userEmail = (req as any).user?.email as string | undefined;
    if (!userEmail) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const clinic = await Clinic.findById(clinicId).exec();
    if (!clinic) {
      res.status(404).json({ error: "Clinic not found" });
      return;
    }

    if (clinic.ownerEmail !== userEmail) {
      res.status(403).json({ error: "Only the owner can add workers" });
      return;
    }

    // TypeScript knows clinic.workers is WorkerSubdoc[]
    if (
      (clinic.workers as WorkerSubdoc[]).some((w) => w.email === email) ||
      clinic.ownerEmail === email
    ) {
      res.status(409).json({ error: "User is already a worker or owner" });
      return;
    }

    try {
      const fbUser = await admin.auth().getUserByEmail(email);
      const displayName = fbUser.displayName ?? "";
      const photoURL = fbUser.photoURL ?? "";

      clinic.workers.push({
        email,
        name: displayName,
        pictureUrl: photoURL,
        role: "staff",
      });
      await clinic.save();

      res.status(201).json({ email, name: displayName, role: "staff" });
      return;
    } catch (err: any) {
      console.error("Error verifying Firebase user:", err);
      res
        .status(404)
        .json({ error: "No registered Firebase user with that email" });
      return;
    }
  } catch (err: any) {
    console.error("Error in addWorker:", err);
    res.status(500).json({ error: "Server error", details: err.message });
    return;
  }
};

// ────────────────────────────────────────────────────────────────────────────
// 5) removeWorker (owner-only)
// ────────────────────────────────────────────────────────────────────────────
export const removeWorker: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { clinicId, workerEmail } = req.params;
    const userEmail = (req as any).user?.email as string | undefined;
    if (!userEmail) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const clinic = await Clinic.findById(clinicId).exec();
    if (!clinic) {
      res.status(404).json({ error: "Clinic not found" });
      return;
    }

    if (clinic.ownerEmail !== userEmail) {
      res.status(403).json({ error: "Only the owner can remove workers" });
      return;
    }

    // Filter out the worker whose email matches workerEmail
    clinic.workers = (clinic.workers as WorkerSubdoc[]).filter(
      (w) => w.email !== workerEmail
    );
    await clinic.save();

    res.status(200).json({ message: "Worker removed" });
    return;
  } catch (err: any) {
    console.error("Error in removeWorker:", err);
    res.status(500).json({ error: "Server error", details: err.message });
    return;
  }
};

// ────────────────────────────────────────────────────────────────────────────
// 6) updateWorker (owner-only)
// ────────────────────────────────────────────────────────────────────────────
export const updateWorker: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { clinicId, workerEmail } = req.params;
    const { name, role } = req.body as { name?: string; role?: string };
    const userEmail = (req as any).user?.email as string | undefined;
    if (!userEmail) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const clinic = await Clinic.findById(clinicId).exec();
    if (!clinic) {
      res.status(404).json({ error: "Clinic not found" });
      return;
    }

    if (clinic.ownerEmail !== userEmail) {
      res.status(403).json({ error: "Only the owner can update workers" });
      return;
    }

    const idx = (clinic.workers as WorkerSubdoc[]).findIndex(
      (w) => w.email === workerEmail
    );
    if (idx === -1) {
      res.status(404).json({ error: "Worker not found" });
      return;
    }

    if (name !== undefined) {
      (clinic.workers as WorkerSubdoc[])[idx].name = name;
    }
    if (role !== undefined) {
      (clinic.workers as WorkerSubdoc[])[idx].role = role;
    }
    await clinic.save();

    res.status(200).json((clinic.workers as WorkerSubdoc[])[idx]);
    return;
  } catch (err: any) {
    console.error("Error in updateWorker:", err);
    res.status(500).json({ error: "Server error", details: err.message });
    return;
  }
};

// ────────────────────────────────────────────────────────────────────────────
// 7) joinClinic (any authenticated user can join by clinicId)
// ────────────────────────────────────────────────────────────────────────────
export const joinClinic: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { clinicId } = req.params;
    const { joinCode } = req.body as { joinCode?: string };
    const userEmail = (req as any).user?.email as string | undefined;
    if (!userEmail) {
      console.log("No userEmail found in req.user!", (req as any).user);
      res.status(401).json({ error: "No userEmail" });
      return;
    }

    if (!joinCode || joinCode !== clinicId) {
      res.status(400).json({ error: "joinCode is invalid or missing" });
      return;
    }

    const clinic = await Clinic.findById(clinicId).exec();
    if (!clinic) {
      console.log("No clinic found");
      res.status(404).json({ error: "No clinic" });
      return;
    }

    // Prevent owner from re‐joining
    if (clinic.ownerEmail === userEmail) {
      res.status(409).json({ error: "Owner cannot join as worker" });
      return;
    }

    // Prevent duplicate entries
    const alreadyWorker = (clinic.workers as WorkerSubdoc[]).some(
      (w) => w.email === userEmail
    );
    if (alreadyWorker) {
      res.status(409).json({ error: "Already a worker" });
      return;
    }

    // Pull displayName + photoURL from Firebase token payload
    const displayName = (req as any).user?.name ?? "Unknown";
    const photoURL = (req as any).user?.picture ?? "";

    // Add new worker
    clinic.workers.push({
      email: userEmail,
      name: displayName,
      pictureUrl: photoURL,
      role: "staff",
    });
    await clinic.save();

    console.log("Joined clinic, new workers list:", clinic.workers);
    res.status(200).json({ message: "Joined clinic", workers: clinic.workers });
    return;
  } catch (err: any) {
    console.error("FATAL joinClinic error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
    return;
  }
};

// ────────────────────────────────────────────────────────────────────────────
// 8) getWorkersList (owner or worker can see the list of workers)
// ────────────────────────────────────────────────────────────────────────────
export const getWorkersList: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { clinicId } = req.params;
    const clinic = await Clinic.findById(clinicId).exec();
    if (!clinic) {
      res.status(404).json({ error: "Clinic not found" });
      return;
    }

    // Return only the workers array
    res.status(200).json(clinic.workers);
    return;
  } catch (err: any) {
    console.error("Error in GET /clinic/:clinicId/workers:", err);
    res.status(500).json({ error: "Server error", details: err.message });
    return;
  }
};
