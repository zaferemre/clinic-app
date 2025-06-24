import { RequestHandler } from "express";
import * as roleService from "../services/roleService";

// List roles
export const listRoles: RequestHandler = async (req, res, next) => {
  try {
    const roles = await roleService.listRoles(
      req.params.companyId,
      req.params.clinicId
    );
    res.json(roles);
  } catch (err) {
    next(err);
  }
};

// Create role
export const addRole: RequestHandler = async (req, res, next) => {
  try {
    // Use authenticated UID, fallback to request if necessary
    const uid = (req.user as any)?.uid ?? req.body.createdBy;
    const role = await roleService.addRole(
      req.params.companyId,
      req.params.clinicId,
      { ...req.body, createdBy: uid }
    );
    res.status(201).json(role);
  } catch (err) {
    next(err);
  }
};

// Update role
export const updateRole: RequestHandler = async (req, res, next) => {
  try {
    const updated = await roleService.updateRole(
      req.params.companyId,
      req.params.clinicId,
      req.params.roleId,
      req.body
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Delete role
export const deleteRole: RequestHandler = async (req, res, next) => {
  try {
    await roleService.deleteRole(
      req.params.companyId,
      req.params.clinicId,
      req.params.roleId
    );
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
