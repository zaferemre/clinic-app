// src/controllers/serviceController.ts
import { RequestHandler } from "express";
import Company, { ServiceInfo } from "../models/Company";

// GET  /company/:companyId/services
export const getServices: RequestHandler = async (req, res): Promise<void> => {
  try {
    const company = await Company.findById(req.params.companyId).exec();
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }
    res.json(company.services);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST /company/:companyId/services
export const createService: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { serviceName, servicePrice, serviceKapora, serviceDuration } =
      req.body;
    if (!serviceName || servicePrice == null || serviceDuration == null) {
      res.status(400).json({ error: "Eksik alanlar var." });
      return;
    }
    const company = await Company.findById(req.params.companyId).exec();
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    const newSvc = {
      serviceName,
      servicePrice,
      serviceKapora,
      serviceDuration,
    };
    company.services.push(newSvc);
    await company.save();
    res.status(201).json(company.services[company.services.length - 1]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// PUT  /company/:companyId/services/:serviceId
export const updateService: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { serviceId, companyId } = req.params;
    const updates = req.body as Partial<ServiceInfo>;
    const company = await Company.findById(companyId).exec();
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    const svc = company.services.id(serviceId);
    if (!svc) {
      res.status(404).json({ error: "Service not found" });
      return;
    }

    Object.entries(updates).forEach(([k, v]) => {
      // @ts-ignore
      svc[k] = v;
    });

    await company.save();
    res.json(svc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /company/:companyId/services/:serviceId
export const deleteService: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { companyId, serviceId } = req.params;
    const company = await Company.findById(companyId).exec();
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    const svc = company.services.id(serviceId);
    if (!svc) {
      res.status(404).json({ error: "Service not found" });
      return;
    }

    svc.remove();
    await company.save();
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
