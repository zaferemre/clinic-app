import { Router } from "express";
import * as companyController from "../controllers/companyController";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeCompanyAccess } from "../middlewares/authorizeCompanyAccess";

const router = Router();

// 1) auth middleware for *all* company routes
router.use(verifyFirebaseToken);

// 2) public/before-membership routes
router.post("/join", companyController.joinByCode);
router.post("/:companyId/clinics/:clinicId/join", companyController.joinClinic);
router.post("/", companyController.createCompany);
router.get("/", companyController.listCompanies);
router.get("/:companyId", companyController.getCompanyById);

// this one doesn’t include a companyId, so leave it here:
router.delete("/user", companyController.deleteUserAccount);

// 3) everything below now requires a real :companyId
router.use("/:companyId", authorizeCompanyAccess);

// Company-scoped actions
router.patch("/:companyId", companyController.updateCompany);
router.delete("/:companyId", companyController.deleteCompany);
router.get("/:companyId/employees", companyController.listEmployees);
router.post("/:companyId/leave", companyController.leaveCompany);

export default router;
