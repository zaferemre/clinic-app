import { Router } from "express";
import * as clinicCtrl from "../controllers/clinicController";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeCompanyAccess } from "../middlewares/authorizeCompanyAccess";

const router = Router({ mergeParams: true });

router.use(verifyFirebaseToken);

router.get("/", clinicCtrl.listClinics);
router.post("/", clinicCtrl.createClinic);
router.get("/:clinicId", clinicCtrl.getClinicById);
router.use(authorizeCompanyAccess);
router.get("/:clinicId/qr-token", clinicCtrl.getQrToken);

router.patch("/:clinicId", clinicCtrl.updateClinic);
router.delete("/:clinicId", clinicCtrl.deleteClinic);

export default router;
