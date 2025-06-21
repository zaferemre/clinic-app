// src/routes/patientRoutes.ts
import { Router } from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";

import * as patientCtrl from "../controllers/patientController";
const router = Router({ mergeParams: true });
router.use(verifyFirebaseToken);
router.post("/", patientCtrl.createPatient);
router.get("/", patientCtrl.listPatients);
router.get("/:patientId", patientCtrl.getPatientById);
router.patch("/:patientId", patientCtrl.updatePatient);
router.post("/:patientId/payments", patientCtrl.recordPayment);
router.get("/:patientId/appointments", patientCtrl.getPatientAppointments);
router.post("/:patientId/call-flag", patientCtrl.flagPatientCall);
router.delete("/:patientId", patientCtrl.deletePatient);

export default router;
