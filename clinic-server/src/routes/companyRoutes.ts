import express from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeCompanyAccess } from "../middlewares/authorizeCompanyAccess";
import {
  createCompany,
  getCompany,
  updateCompany,
  deleteCompany,
  listEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  joinCompany,
  leaveCompany,
  getEmployeeSchedule,
  updateWorkingHours,
  updateServices,
  getServices,
  deleteUserAccount,
} from "../controllers/companyController";
import {
  listRoles,
  addRole,
  updateRole,
  deleteRole,
} from "../controllers/roleController";

const router = express.Router();

// all routes need a valid Firebase token
router.use(verifyFirebaseToken);

// Public (token-only) endpoints
router.post("/", createCompany);
router.post("/:companyId/join", joinCompany);
router.post("/:companyId/leave", leaveCompany);

// everything under /:companyId now also needs company access
router.use("/:companyId", authorizeCompanyAccess);

// Basic company ops
router.get("/", getCompany);
router.get("/:companyId", getCompany);
router.patch("/:companyId", updateCompany);
router.delete("/:companyId", deleteCompany);

// Employee management
router.post("/:companyId/employees", addEmployee);
router.get("/:companyId/employees", listEmployees);
router.patch("/:companyId/employees/:employeeId", updateEmployee);
router.delete("/:companyId/employees/:employeeId", deleteEmployee);

// Scheduling
router.get("/:companyId/schedule/:employeeId", getEmployeeSchedule);

// Owner‐only settings
router.patch("/:companyId/working-hours", updateWorkingHours);
router.patch("/:companyId/services", updateServices);
router.get("/:companyId/services", getServices);

// Role management
router.get("/:companyId/roles", listRoles);
router.post("/:companyId/roles", addRole);
router.patch("/:companyId/roles", updateRole);
router.delete("/:companyId/roles/:role", deleteRole);

// Delete current user account
router.delete("/user", deleteUserAccount);

export default router;
