// src/routes/EmployeeRoutes.ts
import express from "express";
import {
  listEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeCompanyAccess } from "../middlewares/authorizeCompanyAccess";

const router = express.Router();

// wrap async handlers
const wrap =
  (fn: (req: any, res: any, next: any) => Promise<any>) =>
  (req: any, res: any, next: any) =>
    fn(req, res, next).catch(next);

router.use(verifyFirebaseToken, authorizeCompanyAccess);

router.get("/:companyId/employees", wrap(listEmployees));

router.post("/:companyId/employees", wrap(addEmployee));

router.patch("/:companyId/employees/:employeeId", wrap(updateEmployee));

router.delete("/:companyId/employees/:employeeId", wrap(deleteEmployee));

export default router;
