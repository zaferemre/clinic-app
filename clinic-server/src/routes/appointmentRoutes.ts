import express from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeCompanyAccess } from "../middlewares/authorizeCompanyAccess";
import {
  getAppointments,
  createAppointment,
  completeAppointment,
} from "../controllers/appointmentController";

const router = express.Router();

// GET /Company/:companyId/appointments
router.get(
  "/:companyId/appointments",
  verifyFirebaseToken,
  authorizeCompanyAccess,
  getAppointments
);

// POST /Company/:companyId/appointments
router.post(
  "/:companyId/appointments",
  verifyFirebaseToken,
  authorizeCompanyAccess,
  createAppointment
);

// PATCH /Company/:companyId/appointments/:appointmentId/complete
router.patch(
  "/:companyId/appointments/:appointmentId/complete",
  verifyFirebaseToken,
  authorizeCompanyAccess,
  completeAppointment
);

export default router;
