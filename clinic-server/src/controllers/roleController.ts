import { Request, Response, NextFunction } from "express";
import * as roleService from "../services/roleService";

export const listRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roles = await roleService.listRoles(req.params.companyId);
    res.json(roles);
  } catch (err) {
    next(err);
  }
};

export const addRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roles = await roleService.addRole(
      req.params.companyId,
      req.body.role
    );
    res.status(201).json(roles);
  } catch (err) {
    next(err);
  }
};

export const updateRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roles = await roleService.updateRole(
      req.params.companyId,
      req.body.oldRole,
      req.body.newRole
    );
    res.json(roles);
  } catch (err) {
    next(err);
  }
};

export const deleteRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roles = await roleService.deleteRole(
      req.params.companyId,
      req.params.role
    );
    res.json(roles);
  } catch (err) {
    next(err);
  }
};
