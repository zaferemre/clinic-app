import { Router } from "express";
import * as clinicKvkkCtrl from "../controllers/clinicKvkkController";

const router = Router({ mergeParams: true });
router.get("/", clinicKvkkCtrl.getClinicKvkk);
router.post("/", clinicKvkkCtrl.setClinicKvkk);

export default router;
