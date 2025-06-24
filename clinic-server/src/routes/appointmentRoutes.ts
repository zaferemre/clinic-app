import { Router } from "express";
import * as apptCtrl from "../controllers/appointmentController";
const router = Router({ mergeParams: true });

router.get("/", apptCtrl.listAppointments);
router.get("/:appointmentId", apptCtrl.getAppointment);
router.post("/", apptCtrl.createAppointment);
router.patch("/:appointmentId", apptCtrl.updateAppointment);
router.delete("/:appointmentId", apptCtrl.deleteAppointment);

export default router;
