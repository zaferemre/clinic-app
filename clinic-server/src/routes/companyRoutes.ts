import express from "express";
import {
  createCompany,
  getCompany,
  updateCompany,
  addEmployee,
  getEmployeeSchedule,
  updateWorkingHours,
  updateServices,
  getEmployees,
} from "../controllers/companyController";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";

const router = express.Router();

// All routes below require Firebase Auth
router.use(verifyFirebaseToken);

router.post("/", createCompany); // POST /company → create new company
router.get("/", getCompany); // GET /company → get company for current user
router.patch("/", updateCompany); // PATCH /company → update fields

router.get("/:companyId", getCompany); // GET /company/:companyId → get company by ID
router.post("/:companyId/employees", addEmployee); // POST /company/employees → add new employee
router.get("/schedule/:employeeId", getEmployeeSchedule); // GET /company/schedule/:employeeId
router.patch("/working-hours", updateWorkingHours);
router.patch("/services", updateServices);
router.get("/:companyId/employees", getEmployees);
router.get("/:companyId/schedule/:employeeId", getEmployeeSchedule);

export default router;
