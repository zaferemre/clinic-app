import { RequestHandler } from "express";
import * as empService from "../services/employeeService";

// List employees in a clinic/company
export const listEmployees: RequestHandler = async (req, res, next) => {
  try {
    const emps = await empService.listEmployees(
      req.params.companyId,
      req.params.clinicId
    );
    res.json(emps);
  } catch (err) {
    next(err);
  }
};

// Add (or update) employee
export const upsertEmployee: RequestHandler = async (req, res, next) => {
  try {
    const { userUid, ...data } = req.body;
    const emp = await empService.upsertEmployee(
      req.params.companyId,
      req.params.clinicId,
      userUid,
      data
    );
    res.status(201).json(emp);
  } catch (err) {
    next(err);
  }
};

// Remove employee (by userUid)
export const removeEmployee: RequestHandler = async (req, res, next) => {
  try {
    await empService.removeEmployee(
      req.params.companyId,
      req.params.clinicId,
      req.params.userUid
    );
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

// Basic CRUD (by employeeId, for admin panel etc)
export const addEmployee: RequestHandler = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const data = req.body;
    const employee = await empService.addEmployee(companyId, data);
    res.status(201).json(employee);
  } catch (err) {
    next(err);
  }
};
export const updateEmployee: RequestHandler = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const data = req.body;
    const employee = await empService.updateEmployee(employeeId, data);
    res.json(employee);
  } catch (err) {
    next(err);
  }
};
export const deleteEmployee: RequestHandler = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    await empService.deleteEmployee(employeeId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
