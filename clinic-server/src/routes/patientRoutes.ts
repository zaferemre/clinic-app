import { Router } from "express";
import * as patientCtrl from "../controllers/patientController";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";

const router = Router({ mergeParams: true });
router.use(verifyFirebaseToken);

router.post("/", patientCtrl.createPatient);
router.get("/", patientCtrl.listPatients);
router.get("/:patientId", patientCtrl.getPatientById);
router.patch("/:patientId", patientCtrl.updatePatient);
router.delete("/:patientId", patientCtrl.deletePatient);

// Extra: Payments, Appointments, Flags
router.post("/:patientId/payments", patientCtrl.recordPayment);
router.get("/:patientId/appointments", patientCtrl.getPatientAppointments);
router.post("/:patientId/call-flag", patientCtrl.flagPatientCall);
export default router;
