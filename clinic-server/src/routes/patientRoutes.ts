import express from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeCompanyAccess } from "../middlewares/authorizeCompanyAccess";
import {
  createPatient,
  getPatients,
  updatePatient,
  recordPayment,
  getPatientAppointments,
  flagPatientCall,
  deletePatient,
} from "../controllers/patientController";

const router = express.Router();

// require token + access for any :companyId
router.use("/:companyId", verifyFirebaseToken, authorizeCompanyAccess);

router.post("/:companyId/patients", createPatient);
router.get("/:companyId/patients", getPatients);
router.patch("/:companyId/patients/:patientId", updatePatient);
router.patch("/:companyId/patients/:patientId/payment", recordPayment);
router.patch("/:companyId/patients/:patientId/flag-call", flagPatientCall);
router.get(
  "/:companyId/patients/:patientId/appointments",
  getPatientAppointments
);
router.delete("/:companyId/patients/:patientId", deletePatient);

export default router;
