import express from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeClinicAccess } from "../middlewares/authorizeClinicAccess";
import {
  getAppointments,
  createAppointment,
  completeAppointment,
} from "../controllers/appointmentController";

const router = express.Router();

// GET /clinic/:clinicId/appointments
router.get(
  "/:clinicId/appointments",
  verifyFirebaseToken,
  authorizeClinicAccess,
  getAppointments
);

// POST /clinic/:clinicId/appointments
router.post(
  "/:clinicId/appointments",
  verifyFirebaseToken,
  authorizeClinicAccess,
  createAppointment
);

// PATCH /clinic/:clinicId/appointments/:appointmentId/complete
router.patch(
  "/:clinicId/appointments/:appointmentId/complete",
  verifyFirebaseToken,
  authorizeClinicAccess,
  completeAppointment
);

export default router;
