import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Company from "../models/Company";
import Employee from "../models/Employee";

/**
 * Middleware to check if the authenticated user has access to the specified company.
 * Access is granted if:
 * - User is the owner (by email or userId)
 * - User is found as an employee (by email or userId)
 */
export const authorizeCompanyAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { companyId } = req.params;
  const user = (req as any).user; // set by verifyFirebaseToken

  if (!user || !user.email) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    // Validate company existence
    const company = await Company.findById(companyId).exec();
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    // --- Owner access: check email and userId ---
    if (
      company.ownerEmail === user.email ||
      (company.ownerUserId && company.ownerUserId === user.uid)
    ) {
      (req as any).company = company;
      return next();
    }

    // --- Employee access: check by email or userId ---
    const employee = await Employee.findOne({
      companyId: new mongoose.Types.ObjectId(companyId),
      $or: [{ email: user.email }, { userId: user.uid }],
    }).exec();

    if (employee) {
      (req as any).company = company;
      return next();
    }

    // --- Otherwise: forbidden ---

    res.status(403).json({ error: "Unauthorized access" });
  } catch (err) {
    console.error("Error in authorizeCompanyAccess:", err);
    res.status(500).json({ error: "Server error" });
  }
};
