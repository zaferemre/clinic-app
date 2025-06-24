import { Router } from "express";
import * as companyCtrl from "../controllers/companyController";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeCompanyAccess } from "../middlewares/authorizeCompanyAccess";

const router = Router();

router.use(verifyFirebaseToken);

router.post("/", companyCtrl.createCompany);
router.get("/", companyCtrl.listCompanies);

// Join a company via code
router.post("/join", companyCtrl.joinByCode);

// All below require :companyId in params!
router.use("/:companyId", authorizeCompanyAccess);

router.get("/:companyId", companyCtrl.getCompany);
router.patch("/:companyId", companyCtrl.updateCompany);
router.delete("/:companyId", companyCtrl.deleteCompany);

router.post("/:companyId/leave", companyCtrl.leaveCompany);

// List company employees (optionally filter by clinic)
router.get("/:companyId/employees", companyCtrl.listEmployees);

export default router;
