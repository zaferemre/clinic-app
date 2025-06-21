import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import * as companyService from "../services/companyService";
import * as employeeService from "../services/employeeService";
import Employee from "../models/Employee";
import Clinic from "../models/Clinic";
import mongoose from "mongoose";
import { IUser } from "../thirdParty/firebaseAdminService";

// --- CREATE COMPANY (OWNER FLOW) --- //
export const createCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, websiteUrl, socialLinks, settings } = req.body;
    const user = req.user as IUser;
    if (!user) throw createError(401, "Unauthorized");

    // Only pass user input fields, service will use user for owner info
    const company = await companyService.createCompany(user, {
      name,
      websiteUrl,
      socialLinks,
      settings,
    });

    res.status(201).json(company);
  } catch (err) {
    next(err);
  }
};

export const getCompanyById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const companyId = req.params.companyId;
    const company = await companyService.getCompany(companyId);
    res.status(200).json(company);
  } catch (err) {
    next(err);
  }
};

export const updateCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const companyId = req.params.companyId;
    const user = req.user as IUser;
    const updated = await companyService.updateCompany(
      companyId,
      req.body,
      user
    );
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const companyId = req.params.companyId;
    const user = req.user as IUser;
    await companyService.deleteCompany(companyId, user);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export const listEmployees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const companyId = req.params.companyId;
    const employees = await employeeService.listEmployees(companyId);
    res.status(200).json(employees);
  } catch (err) {
    next(err);
  }
};

export const leaveCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const companyId = req.params.companyId;
    const user = req.user as IUser;
    await companyService.leaveCompany(companyId, user.email!);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export const deleteUserAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as IUser;
    await companyService.deleteUserAccount(user);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export const joinByCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { joinCode } = req.body as { joinCode: string };
    if (!joinCode) throw createError(400, "Join code required");

    const user = req.user as IUser;
    const result = await companyService.joinByCode(joinCode, user);

    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const joinClinic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { companyId, clinicId } = req.params;
    const email = (req.user as any).email;
    const emp = await Employee.findOne({
      companyId: new mongoose.Types.ObjectId(companyId),
      email,
    });
    if (!emp) throw createError(404, "Must join company first");
    emp.clinicId = new mongoose.Types.ObjectId(clinicId) as any;
    await emp.save();
    await Clinic.findByIdAndUpdate(clinicId, {
      $addToSet: { employees: emp._id },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const listCompanies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as IUser;
    // Use new service (covers both owner and employee)
    const companies = await companyService.listCompanies(user);
    res.status(200).json(companies);
  } catch (err) {
    next(err);
  }
};
