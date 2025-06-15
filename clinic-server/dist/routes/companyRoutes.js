"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyFirebaseToken_1 = require("../middlewares/verifyFirebaseToken");
const authorizeCompanyAccess_1 = require("../middlewares/authorizeCompanyAccess");
const companyController_1 = require("../controllers/companyController");
const roleController_1 = require("../controllers/roleController");
const router = express_1.default.Router();
// all routes need a valid Firebase token
router.use(verifyFirebaseToken_1.verifyFirebaseToken);
// Public (token-only) endpoints
router.post("/", companyController_1.createCompany);
router.post("/:companyId/join", companyController_1.joinCompany);
router.post("/:companyId/leave", companyController_1.leaveCompany);
// everything under /:companyId now also needs company access
router.use("/:companyId", authorizeCompanyAccess_1.authorizeCompanyAccess);
// Basic company ops
router.get("/", companyController_1.getCompany);
router.get("/:companyId", companyController_1.getCompany);
router.patch("/:companyId", companyController_1.updateCompany);
router.delete("/:companyId", companyController_1.deleteCompany);
// Employee management
router.post("/:companyId/employees", companyController_1.addEmployee);
router.get("/:companyId/employees", companyController_1.listEmployees);
router.patch("/:companyId/employees/:employeeId", companyController_1.updateEmployee);
router.delete("/:companyId/employees/:employeeId", companyController_1.deleteEmployee);
// Scheduling
router.get("/:companyId/schedule/:employeeId", companyController_1.getEmployeeSchedule);
// Owner‐only settings
router.patch("/:companyId/working-hours", companyController_1.updateWorkingHours);
router.patch("/:companyId/services", companyController_1.updateServices);
router.get("/:companyId/services", companyController_1.getServices);
// Role management
router.get("/:companyId/roles", roleController_1.listRoles);
router.post("/:companyId/roles", roleController_1.addRole);
router.patch("/:companyId/roles", roleController_1.updateRole);
router.delete("/:companyId/roles/:role", roleController_1.deleteRole);
// Delete current user account
router.delete("/user", companyController_1.deleteUserAccount);
exports.default = router;
