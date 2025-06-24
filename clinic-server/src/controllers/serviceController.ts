import { RequestHandler } from "express";
import * as serviceService from "../services/serviceService";

// List services
export const listServices: RequestHandler = async (req, res, next) => {
  try {
    const services = await serviceService.listServices(
      req.params.companyId,
      req.params.clinicId
    );
    res.json(services);
  } catch (err) {
    next(err);
  }
};

// Create service
export const createService: RequestHandler = async (req, res, next) => {
  try {
    const service = await serviceService.createService(
      req.params.companyId,
      req.params.clinicId,
      req.body
    );
    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
};

// Update service
export const updateService: RequestHandler = async (req, res, next) => {
  try {
    const updated = await serviceService.updateService(
      req.params.companyId,
      req.params.clinicId,
      req.params.serviceId,
      req.body
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Delete service
export const deleteService: RequestHandler = async (req, res, next) => {
  try {
    await serviceService.deleteService(
      req.params.companyId,
      req.params.clinicId,
      req.params.serviceId
    );
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
