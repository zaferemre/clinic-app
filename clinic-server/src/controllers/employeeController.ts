import { RequestHandler } from "express";
import * as empService from "../services/employeeService";

// Listele (enriched)
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

// Upsert (userUid)
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

// Remove (userUid)
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

// createEmployee (admin panel)
export const createEmployee: RequestHandler = async (req, res, next) => {
  try {
    const emp = await empService.createEmployee(req.body);
    res.status(201).json(emp);
  } catch (err) {
    next(err);
  }
};

// updateEmployee (employeeId)
export const updateEmployee: RequestHandler = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const emp = await empService.updateEmployee(employeeId, req.body);
    res.json(emp);
  } catch (err) {
    next(err);
  }
};

// deleteEmployee (employeeId)
export const deleteEmployee: RequestHandler = async (req, res, next) => {
  try {
    await empService.deleteEmployee(req.params.employeeId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
