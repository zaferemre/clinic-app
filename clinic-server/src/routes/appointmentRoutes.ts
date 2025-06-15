import express from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeCompanyAccess } from "../middlewares/authorizeCompanyAccess";
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointmentController";

const router = express.Router();

// require token + access for any :companyId
router.use("/:companyId", verifyFirebaseToken, authorizeCompanyAccess);

router.get("/:companyId/appointments", getAppointments);
router.get("/:companyId/appointments/:appointmentId", getAppointmentById);
router.post("/:companyId/appointments", createAppointment);
router.put("/:companyId/appointments/:appointmentId", updateAppointment);
router.patch("/:companyId/appointments/:appointmentId", updateAppointment);
router.delete("/:companyId/appointments/:appointmentId", deleteAppointment);

export default router;
