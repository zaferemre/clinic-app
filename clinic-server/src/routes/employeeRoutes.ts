// src/routes/EmployeeRoutes.ts
import express from "express";
import { listEmployees, addEmployee } from "../controllers/employeeController";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeCompanyAccess } from "../middlewares/authorizeCompanyAccess";

const router = express.Router();

router.use(verifyFirebaseToken, authorizeCompanyAccess);

router.get("/:companyId/employees", listEmployees);

router.post("/:companyId/employees", addEmployee);

export default router;
