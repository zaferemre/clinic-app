// src/routes/companyRoutes.ts

import express from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import {
  createCompany,
  getCompany,
  updateCompany,
  addEmployee,
  getEmployees,
  joinCompany,
  getEmployeeSchedule,
  updateWorkingHours,
  updateServices,
  ensureCompanyAccess,
  getServices,
} from "../controllers/companyController";
import {
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController";
const router = express.Router();

// All routes below require a valid Firebase token
router.use(verifyFirebaseToken);

/**
 * Public (token-protected) endpoints:
 */

// POST /company
router.post("/", createCompany);

// POST /company/:companyId/join
router.post("/:companyId/join", joinCompany);

/**
 * Everything under /:companyId/* after this point
 * now requires either owner OR already-joined employee.
 */
router.use("/:companyId", ensureCompanyAccess);

/**
 * GET /company                → current user’s company (owner or employee)
 * GET /company/:companyId     → same, but by ID
 */
router.get("/", getCompany);
router.get("/:companyId", getCompany);

/**
 * Owner-only top-level update:
 * PATCH /company
 */
router.patch("/", updateCompany);

/**
 * Employee management:
 * POST   /company/:companyId/employees
 * GET    /company/:companyId/employees
 */
router.post("/:companyId/employees", addEmployee);
router.get("/:companyId/employees", getEmployees);

/**
 * Scheduling:
 * GET /company/:companyId/schedule/:employeeId
 */
router.get("/:companyId/schedule/:employeeId", getEmployeeSchedule);

/**
 * Owner-only settings:
 * PATCH /company/:companyId/working-hours
 * PATCH /company/:companyId/services
 */
router.patch("/:companyId/working-hours", updateWorkingHours);
router.patch("/:companyId/services", updateServices);
router.get("/:companyId/services", getServices);
router.patch("/:companyId/employees/:employeeId", updateEmployee);
router.delete("/:companyId/employees/:employeeId", deleteEmployee);

export default router;
