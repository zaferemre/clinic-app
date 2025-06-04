// src/routes/patientRoutes.ts

import express from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeClinicAccess } from "../middlewares/authorizeClinicAccess";
import {
  createPatient,
  getPatients,
  updatePatient,
  recordPayment,
} from "../controllers/patientController";

const router = express.Router();

// POST   /clinic/:clinicId/patients               → create a new patient
router.post(
  "/:clinicId/patients",
  verifyFirebaseToken,
  authorizeClinicAccess,
  createPatient
);

// GET    /clinic/:clinicId/patients               → list all patients
router.get(
  "/:clinicId/patients",
  verifyFirebaseToken,
  authorizeClinicAccess,
  getPatients
);

// PATCH  /clinic/:clinicId/patients/:patientId    → update credit, balanceDue, etc.
router.patch(
  "/:clinicId/patients/:patientId",
  verifyFirebaseToken,
  authorizeClinicAccess,
  updatePatient
);

// PATCH  /clinic/:clinicId/patients/:patientId/payment
//                                                 → record a payment (method = Havale|Card|Cash)
router.patch(
  "/:clinicId/patients/:patientId/payment",
  verifyFirebaseToken,
  authorizeClinicAccess,
  recordPayment
);

export default router;
