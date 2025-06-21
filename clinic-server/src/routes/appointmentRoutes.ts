// src/routes/appointmentRoutes.ts
import { Router } from "express";
import * as apptCtrl from "../controllers/appointmentController";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";

const router = Router({ mergeParams: true });
router.use(verifyFirebaseToken);

router.get("/", apptCtrl.getAppointments);
router.get("/:appointmentId", apptCtrl.getAppointmentById);
router.post("/", apptCtrl.createAppointment);
router.patch("/:appointmentId", apptCtrl.updateAppointment);
router.delete("/:appointmentId", apptCtrl.deleteAppointment);

export default router;
