import { Request, Response, NextFunction } from "express";
import Company from "../models/Company";

export const authorizeCompanyAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { companyId } = req.params;
  const userEmail = (req as any).user?.email as string | undefined;

  if (!userEmail) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    const company = await Company.findById(companyId).exec();
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    // Owner or employee can access
    if (
      company.ownerEmail === userEmail ||
      (company.employees ?? []).some(
        (e: { email: string }) => e.email === userEmail
      )
    ) {
      (req as any).company = company;
      next();
    } else {
      res.status(403).json({ error: "Unauthorized access" });
    }
  } catch (err) {
    console.error("Error in authorizeCompanyAccess:", err);
    res.status(500).json({ error: "Server error" });
  }
};
