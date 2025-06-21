import { RequestHandler } from "express";
import * as roleService from "../services/roleService";

export const listRoles: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId } = req.params;
    const roles = await roleService.listRoles(companyId, clinicId);
    res.status(200).json(roles);
  } catch (err) {
    next(err);
  }
};

export const addRole: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId } = req.params;
    const created = await roleService.addRole(companyId, clinicId, req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

export const updateRole: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId, roleId } = req.params as {
      companyId: string;
      clinicId: string;
      roleId: string;
    };
    const updated = await roleService.updateRole(
      companyId,
      clinicId,
      roleId,
      req.body
    );
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteRole: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId, roleId } = req.params as {
      companyId: string;
      clinicId: string;
      roleId: string;
    };
    await roleService.deleteRole(companyId, clinicId, roleId);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
