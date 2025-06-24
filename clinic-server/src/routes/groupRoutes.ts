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

// Manage group-patient membership
router.post("/:groupId/patients", groupCtrl.addPatientToGroup);
router.delete(
  "/:groupId/patients/:patientId",
  groupCtrl.removePatientFromGroup
);

// Group appointments
router.get("/:groupId/appointments", groupCtrl.listGroupAppointments);
router.post("/:groupId/appointments", groupCtrl.createGroupAppointment);

export default router;
