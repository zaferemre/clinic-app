// src/routes/groupRoutes.ts
import { Router } from "express";
import * as groupCtrl from "../controllers/groupController";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
const router = Router({ mergeParams: true });

router.use(verifyFirebaseToken);
router.get("/", groupCtrl.listGroups);
router.post("/", groupCtrl.createGroup);
router.get("/:groupId", groupCtrl.getGroupById);
router.patch("/:groupId", groupCtrl.updateGroup);
router.delete("/:groupId", groupCtrl.deleteGroup);

router.post("/:groupId/patients", groupCtrl.addPatientToGroup);
router.delete(
  "/:groupId/patients/:patientId",
  groupCtrl.removePatientFromGroup
);
// list / create appointments for one group:
router.get("/:groupId/appointments", groupCtrl.listGroupAppointments);
router.post("/:groupId/appointments", groupCtrl.createGroupAppointment);

export default router;
