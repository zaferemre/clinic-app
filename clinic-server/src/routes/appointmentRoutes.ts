import express from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeCompanyAccess } from "../middlewares/authorizeCompanyAccess";
import {
  getAppointments,
  createAppointment,
  deleteAppointment,
  updateAppointment,
} from "../controllers/appointmentController";

const router = express.Router();

// All routes require a valid Firebase token + company access
router.use("/:companyId", verifyFirebaseToken, authorizeCompanyAccess);

/**
 * GET   /company/:companyId/appointments
 * POST  /company/:companyId/appointments
 * PATCH /company/:companyId/appointments/:appointmentId/complete
 */
router.get("/:companyId/appointments", getAppointments);
router.post("/:companyId/appointments", createAppointment);
router.delete("/:companyId/appointments/:appointmentId", deleteAppointment);
router.put("/:companyId/appointments/:appointmentId", updateAppointment);
export default router;
