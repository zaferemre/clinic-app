"use strict";
// src/routes/companyRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyFirebaseToken_1 = require("../middlewares/verifyFirebaseToken");
const companyController_1 = require("../controllers/companyController");
const router = express_1.default.Router();
// All routes below require a valid Firebase token
router.use(verifyFirebaseToken_1.verifyFirebaseToken);
/**
 * Public (token-protected) endpoints:
 */
// POST /company
router.post("/", companyController_1.createCompany);
// POST /company/:companyId/join
router.post("/:companyId/join", companyController_1.joinCompany);
/**
 * Everything under /:companyId/* after this point
 * now requires either owner OR already-joined employee.
 */
router.use("/:companyId", companyController_1.ensureCompanyAccess);
/**
 * GET /company                → current user’s company (owner or employee)
 * GET /company/:companyId     → same, but by ID
 */
router.get("/", companyController_1.getCompany);
router.get("/:companyId", companyController_1.getCompany);
/**
 * Owner-only top-level update:
 * PATCH /company
 */
router.patch("/", companyController_1.updateCompany);
/**
 * Employee management:
 * POST   /company/:companyId/employees
 * GET    /company/:companyId/employees
 */
router.post("/:companyId/employees", companyController_1.addEmployee);
router.get("/:companyId/employees", companyController_1.getEmployees);
/**
 * Scheduling:
 * GET /company/:companyId/schedule/:employeeId
 */
router.get("/:companyId/schedule/:employeeId", companyController_1.getEmployeeSchedule);
/**
 * Owner-only settings:
 * PATCH /company/:companyId/working-hours
 * PATCH /company/:companyId/services
 */
router.patch("/:companyId/working-hours", companyController_1.updateWorkingHours);
router.patch("/:companyId/services", companyController_1.updateServices);
router.get("/:companyId/services", companyController_1.getServices);
exports.default = router;
