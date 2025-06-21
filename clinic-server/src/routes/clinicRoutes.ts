// src/routes/clinicRoutes.ts
import { Router } from "express";
import * as clinicCtrl from "../controllers/clinicController";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeCompanyAccess } from "../middlewares/authorizeCompanyAccess";

const router = Router({ mergeParams: true });

// all clinic routes require a valid token and company access
router.use(verifyFirebaseToken);
router.use(authorizeCompanyAccess);

router.get("/", clinicCtrl.listClinics);
router.post("/", clinicCtrl.createClinic);
router.get("/:clinicId", clinicCtrl.getClinicById);
router.patch("/:clinicId", clinicCtrl.updateClinic);
router.delete("/:clinicId", clinicCtrl.deleteClinic);

export default router;
