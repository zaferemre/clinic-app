import { RequestHandler } from "express";
import { IUser } from "../thirdParty/firebaseAdminService";
import * as employeeService from "../services/employeeService";

// --- LIST EMPLOYEES IN A CLINIC ---
export const listEmployees: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId } = req.params as {
      companyId: string;
      clinicId: string;
    };
    const employees = await employeeService.listEmployees(companyId, clinicId);
    res.status(200).json(employees);
  } catch (err) {
    next(err);
  }
};

export const addEmployee: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId } = req.params as {
      companyId: string;
      clinicId: string;
    };
    const user = req.user as IUser;
    const created = await employeeService.addEmployee(
      companyId,
      clinicId,
      req.body,
      user.uid
    );
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

export const updateEmployee: RequestHandler = async (req, res, next) => {
  try {
    const { employeeId } = req.params as { employeeId: string };
    // If you want to check companyId/clinicId, add logic here!
    const updated = await employeeService.updateEmployee(employeeId, req.body);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteEmployee: RequestHandler = async (req, res, next) => {
  try {
    const { employeeId } = req.params as { employeeId: string };
    // If you want to check companyId/clinicId, add logic here!
    await employeeService.deleteEmployee(employeeId);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
