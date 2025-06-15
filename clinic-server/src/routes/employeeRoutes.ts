import express from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeCompanyAccess } from "../middlewares/authorizeCompanyAccess";
import { listEmployees, addEmployee } from "../controllers/employeeController";

const router = express.Router();

// require token + access for any :companyId
router.use("/:companyId", verifyFirebaseToken, authorizeCompanyAccess);

router.get("/:companyId/employees", listEmployees);
router.post("/:companyId/employees", addEmployee);

export default router;
