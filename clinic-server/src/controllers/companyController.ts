import { RequestHandler } from "express";
import * as companyService from "../services/companyService";
import { Types } from "mongoose";

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
  console.log("Gelen req.body:", req.body);

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
    const companyId = new Types.ObjectId(req.params.companyId);
    const company = await companyService.getCompanyById(companyId);
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
    const companyId = new Types.ObjectId(req.params.companyId);
    const updated = await companyService.updateCompany(
      companyId,
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
    const companyId = new Types.ObjectId(req.params.companyId);
    await companyService.deleteCompany(companyId, uid);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

// Join company by code
export const joinByCode: RequestHandler = async (req, res, next) => {
  try {
    const { joinCode } = req.body;
    const user = (req as any).user;
    const result = await companyService.joinByCode(user.uid, joinCode);
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
    const oid = new Types.ObjectId(companyId);
    const result = await companyService.leaveCompany(user.uid, oid);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// List company employees
export const listEmployees: RequestHandler = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const oid = new Types.ObjectId(companyId);
    const employees = await companyService.listEmployees(oid);
    res.json(employees);
  } catch (err) {
    next(err);
  }
};
