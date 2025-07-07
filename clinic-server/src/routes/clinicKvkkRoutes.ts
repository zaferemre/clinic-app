import { Router } from "express";
import * as clinicKvkkCtrl from "../controllers/clinicKvkkController";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeCompanyAccess } from "../middlewares/authorizeCompanyAccess";

const router = Router({ mergeParams: true });
router.get("/", clinicKvkkCtrl.getClinicKvkk);
router.use(verifyFirebaseToken);
router.use(authorizeCompanyAccess);
router.post("/", clinicKvkkCtrl.setClinicKvkk);

export default router;
