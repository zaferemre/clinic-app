import { Request, Response, NextFunction } from "express";
import { IUser } from "../thirdParty/firebaseAdminService";
import * as companyService from "../services/companyService";

// POST   /company
export const createCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const company = await companyService.createCompany(
      req.user as IUser,
      req.body
    );
    res.status(201).json(company);
  } catch (err) {
    next(err);
  }
};

// GET    /company or /company/:companyId
export const getCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dto = await companyService.getCompany(
      req.params.companyId,
      req.user as IUser
    );
    res.status(200).json(dto);
  } catch (err) {
    next(err);
  }
};

// PATCH  /company/:companyId
export const updateCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await companyService.updateCompany(
      req.params.companyId,
      req.body,
      req.user as IUser
    );
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /company/:companyId
export const deleteCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await companyService.deleteCompany(req.params.companyId, req.user as IUser);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// GET    /company/:companyId/employees
export const listEmployees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const list = await companyService.listEmployees(req.params.companyId);
    res.json(list);
  } catch (err) {
    next(err);
  }
};

// POST   /company/:companyId/employees
export const addEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const e = await companyService.addEmployee(req.params.companyId, req.body);
    res.status(201).json(e);
  } catch (err) {
    next(err);
  }
};

// PATCH  /company/:companyId/employees/:employeeId
export const updateEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const e = await companyService.updateEmployee(
      req.params.companyId,
      req.params.employeeId,
      req.body
    );
    res.json(e);
  } catch (err) {
    next(err);
  }
};

// DELETE /company/:companyId/employees/:employeeId
export const deleteEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await companyService.deleteEmployee(
      req.params.companyId,
      req.params.employeeId
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// POST   /company/:companyId/join
export const joinCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const info = await companyService.joinCompany(
      req.params.companyId,
      req.body.joinCode,
      req.user as IUser
    );
    res.json(info);
  } catch (err) {
    next(err);
  }
};

// GET    /company/:companyId/schedule/:employeeId
export const getEmployeeSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sched = await companyService.getEmployeeSchedule(
      req.params.companyId,
      req.params.employeeId,
      (req.user as IUser).email
    );
    res.json(sched);
  } catch (err) {
    next(err);
  }
};

// PATCH  /company/:companyId/working-hours
export const updateWorkingHours = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const wh = await companyService.updateWorkingHours(
      req.params.companyId,
      req.body.workingHours,
      req.user as IUser
    );
    res.json(wh);
  } catch (err) {
    next(err);
  }
};

// PATCH  /company/:companyId/services
export const updateServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const svcs = await companyService.updateServices(
      req.params.companyId,
      req.body.services,
      req.user as IUser
    );
    res.json(svcs);
  } catch (err) {
    next(err);
  }
};

// GET    /company/:companyId/services
export const getServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const svcs = await companyService.getServices(req.params.companyId);
    res.json(svcs);
  } catch (err) {
    next(err);
  }
};

// DELETE /company/user
export const deleteUserAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await companyService.deleteUserAccount(
      (req.user as any).email,
      (req.user as any).uid
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const leaveCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userEmail = req.user?.email!;
    const { companyId } = req.params;

    const result = await companyService.leaveCompany(companyId, userEmail);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
