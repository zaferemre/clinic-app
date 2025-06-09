// src/controllers/serviceController.ts
import { RequestHandler } from "express";
import Company, { ServiceInfo } from "../models/Company";

import { Request, Response } from "express";

// GET  /company/:companyId/services
export const getServices = async (req: Request, res: Response) => {
  try {
    const company = await Company.findById(req.params.companyId).exec();
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json(company.services);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST /company/:companyId/services
export const createService = async (req: Request, res: Response) => {
  try {
    const { serviceName, servicePrice, serviceKapora, serviceDuration } =
      req.body as ServiceInfo;
    const company = await Company.findById(req.params.companyId).exec();
    if (!company) return res.status(404).json({ error: "Company not found" });
    const newSvc = {
      serviceName,
      servicePrice,
      serviceKapora,
      serviceDuration,
    };
    company.services.push(newSvc);
    await company.save();
    // return the last-added subdoc (with its generated _id)
    res.status(201).json(company.services[company.services.length - 1]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// PUT  /company/:companyId/services/:serviceId
export const updateService = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;
    const updates = req.body as Partial<ServiceInfo>;
    const company = await Company.findOneAndUpdate(
      { _id: req.params.companyId, "services._id": serviceId },
      {
        $set: Object.entries(updates).reduce(
          (acc, [k, v]) => ({ ...acc, [`services.$.${k}`]: v }),
          {}
        ),
      },
      { new: true }
    ).exec();
    if (!company) return res.status(404).json({ error: "Service not found" });
    const svc = company.services.id(serviceId);
    res.json(svc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /company/:companyId/services/:serviceId
export const deleteService = async (req: Request, res: Response) => {
  try {
    const company = await Company.findById(req.params.companyId).exec();
    if (!company) return res.status(404).json({ error: "Company not found" });
    company.services.id(req.params.serviceId)?.remove();
    await company.save();
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
