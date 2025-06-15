import { Request, Response, NextFunction } from "express";
import * as employeeService from "../services/employeeService";

export const listEmployees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const list = await employeeService.listEmployees(req.params.companyId);
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
};

export const addEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const e = await employeeService.addEmployee(req.params.companyId, req.body);
    res.status(201).json(e);
  } catch (err) {
    next(err);
  }
};

export const updateEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const e = await employeeService.updateEmployee(
      req.params.companyId,
      req.params.employeeId,
      req.body
    );
    res.status(200).json(e);
  } catch (err) {
    next(err);
  }
};

export const deleteEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await employeeService.deleteEmployee(
      req.params.companyId,
      req.params.employeeId
    );
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};
