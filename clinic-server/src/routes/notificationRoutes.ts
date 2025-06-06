import express from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeClinicAccess } from "../middlewares/authorizeClinicAccess";
import {
  getNotifications,
  markPatientCalled,
} from "../controllers/patientController";

const router = express.Router();

// GET /clinic/:clinicId/notifications
router.get(
  "/:clinicId/notifications",
  verifyFirebaseToken,
  authorizeClinicAccess,
  getNotifications
);

// PATCH /clinic/:clinicId/notifications/:notificationId/mark-called
router.patch(
  "/:clinicId/notifications/:notificationId/mark-called",
  verifyFirebaseToken,
  authorizeClinicAccess,
  markPatientCalled
);

export default router;
