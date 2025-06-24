// src/middleware/authorizeCompanyAccess.ts
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Company from "../models/Company";
import Employee from "../models/Employee";

export const authorizeCompanyAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { companyId } = req.params;
  const user = (req as any).user;
  if (!user?.uid) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }
  try {
    const company = await Company.findById(companyId).exec();
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }
    // Owner access by userId
    if (company.ownerUid && company.ownerUid.toString() === user.uid) {
      (req as any).company = company;
      return next();
    }
    // Employee access by userId
    const emp = await Employee.findOne({
      companyId: new mongoose.Types.ObjectId(companyId),
      userUid: user.uid,
    }).exec();
    if (emp) {
      (req as any).company = company;
      return next();
    }
    res.status(403).json({ error: "Unauthorized access" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
