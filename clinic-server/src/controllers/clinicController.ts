import { Request, Response, NextFunction } from "express";
import * as clinicService from "../services/clinicService";
import Clinic from "../models/Clinic";
import Company from "../models/Company";
import mongoose from "mongoose";

// List all clinics for a company
export const listClinics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { companyId } = req.params;
    const clinics = await clinicService.listClinics(companyId);
    res.status(200).json(clinics);
  } catch (err) {
    next(err);
  }
};

// Create new clinic for a company
export const createClinic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { companyId } = req.params;
    const { name, address, phoneNumber, workingHours } = req.body;

    const exists = await Clinic.findOne({
      companyId: new mongoose.Types.ObjectId(companyId),
      name,
    });
    if (exists) {
      res
        .status(400)
        .json({ message: "A clinic with this name already exists." });
      return;
    }

    const clinic = await clinicService.createClinic(companyId, {
      name,
      address,
      phoneNumber,
      workingHours,
      services: [],
    });

    await Company.findByIdAndUpdate(companyId, {
      $addToSet: { clinics: clinic._id },
    });

    res.status(201).json(clinic);
  } catch (err) {
    next(err);
  }
};

export const getClinicById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { companyId, clinicId } = req.params;
    const clinic = await clinicService.getClinic(companyId, clinicId);
    res.status(200).json(clinic);
  } catch (err) {
    next(err);
  }
};

export const updateClinic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { companyId, clinicId } = req.params;
    const updated = await clinicService.updateClinic(
      companyId,
      clinicId,
      req.body
    );
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteClinic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { companyId, clinicId } = req.params;
    await clinicService.deleteClinic(companyId, clinicId);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
