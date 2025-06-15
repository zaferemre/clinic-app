import { Request, Response, NextFunction } from "express";
import * as svcService from "../services/serviceService";

export const getServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const list = await svcService.getServices(req.params.companyId);
    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const createService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const s = await svcService.createService(req.params.companyId, req.body);
    res.status(201).json(s);
  } catch (err) {
    next(err);
  }
};

export const updateService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const s = await svcService.updateService(
      req.params.companyId,
      req.params.serviceId,
      req.body
    );
    res.json(s);
  } catch (err) {
    next(err);
  }
};

export const deleteService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await svcService.deleteService(req.params.companyId, req.params.serviceId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
