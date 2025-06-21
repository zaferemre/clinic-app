// src/controllers/serviceController.ts
import { Request, Response, NextFunction } from "express";
import Service, { ServiceDocument } from "../models/Service";
import Clinic from "../models/Clinic";
import { UpdateQuery } from "mongoose";

/**
 * GET  /company/:companyId/clinics/:clinicId/services
 */
export const listServices = async (
  req: Request<{ companyId: string; clinicId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { companyId, clinicId } = req.params;
    const services = await Service.find({ companyId, clinicId }).exec();
    res.json(services);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /company/:companyId/clinics/:clinicId/services
 */
export const createService = async (
  req: Request<{ companyId: string; clinicId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { companyId, clinicId } = req.params;
    const { serviceName, servicePrice, serviceDuration } = req.body;

    const svc = new Service({
      companyId,
      clinicId,
      serviceName,
      servicePrice,
      serviceDuration,
    });
    await svc.save();

    // push into clinic.services
    await Clinic.findByIdAndUpdate(clinicId, {
      $addToSet: { services: svc._id },
    }).exec();

    res.status(201).json(svc);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH  /company/:companyId/clinics/:clinicId/services/:serviceId
 */
export const updateService = async (
  req: Request<
    { companyId: string; clinicId: string; serviceId: string },
    ServiceDocument,
    Partial<
      Pick<ServiceDocument, "serviceName" | "servicePrice" | "serviceDuration">
    >
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const { serviceId } = req.params;
    const updates = req.body as UpdateQuery<ServiceDocument>;

    const svc = await Service.findByIdAndUpdate(serviceId, updates, {
      new: true,
    }).exec();

    // **send back the updated document**
    res.json(svc);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /company/:companyId/clinics/:clinicId/services/:serviceId
 */
export const deleteService = async (
  req: Request<{ clinicId: string; serviceId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { clinicId, serviceId } = req.params;

    await Service.findByIdAndDelete(serviceId).exec();
    await Clinic.findByIdAndUpdate(clinicId, {
      $pull: { services: serviceId },
    }).exec();

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
