import { RequestHandler } from "express";
import * as companyService from "../services/companyService";

// List all companies user belongs to
export const listCompanies: RequestHandler = async (req, res, next) => {
  try {
    const uid = (req.user as any)?.uid;
    // Now returns array of user's memberships, not company objects
    const companies = await companyService.getCompaniesForUser(uid);
    res.json(companies);
  } catch (err) {
    next(err);
  }
};

// Create new company
export const createCompany: RequestHandler = async (req, res, next) => {
  try {
    const uid = (req.user as any)?.uid;
    const company = await companyService.createCompany(uid, req.body);
    res.status(201).json(company);
  } catch (err) {
    next(err);
  }
};

// Get company by ID
export const getCompany: RequestHandler = async (req, res, next) => {
  try {
    const company = await companyService.getCompanyById(req.params.companyId);
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }
    res.json(company);
  } catch (err) {
    next(err);
  }
};

// Update company (owner only)
export const updateCompany: RequestHandler = async (req, res, next) => {
  try {
    const uid = (req.user as any)?.uid;
    const updated = await companyService.updateCompany(
      req.params.companyId,
      req.body,
      uid
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Delete company (owner only)
export const deleteCompany: RequestHandler = async (req, res, next) => {
  try {
    const uid = (req.user as any)?.uid;
    await companyService.deleteCompany(req.params.companyId, uid);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

// Join company by code
export const joinByCode: RequestHandler = async (req, res, next) => {
  try {
    const { code } = req.body;
    const user = (req as any).user;
    const result = await companyService.joinByCode(user.uid, code);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Leave company
export const leaveCompany: RequestHandler = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const user = (req as any).user;
    const result = await companyService.leaveCompany(user.uid, companyId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// List company employees
export const listEmployees: RequestHandler = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const employees = await companyService.listEmployees(companyId);
    res.json(employees);
  } catch (err) {
    next(err);
  }
};
