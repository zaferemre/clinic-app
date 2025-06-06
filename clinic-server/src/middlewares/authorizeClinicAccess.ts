import { Request, Response, NextFunction } from "express";
import Clinic from "../models/Clinic";

export const authorizeClinicAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { clinicId } = req.params;
  const userEmail = (req as any).user?.email as string | undefined;

  if (!userEmail) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    const clinic = await Clinic.findById(clinicId).exec();
    if (!clinic) {
      res.status(404).json({ error: "Clinic not found" });
      return;
    }

    // Owner can always access; otherwise check in workers array
    if (
      clinic.ownerEmail === userEmail ||
      clinic.workers.find((w: { email: string }) => w.email === userEmail)
    ) {
      (req as any).clinic = clinic;
      next();
    } else {
      res.status(403).json({ error: "Unauthorized access" });
    }
  } catch (err) {
    console.error("Error in authorizeClinicAccess:", err);
    res.status(500).json({ error: "Server error" });
  }
};
