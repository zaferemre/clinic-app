import express from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeCompanyAccess } from "../middlewares/authorizeCompanyAccess";
import {
  getNotifications,
  markPatientCalled,
} from "../controllers/patientController";

const router = express.Router();

// GET /Company/:companyId/notifications
router.get(
  "/:companyId/notifications",
  verifyFirebaseToken,
  authorizeCompanyAccess,
  getNotifications
);

// PATCH /Company/:companyId/notifications/:notificationId/mark-called
router.patch(
  "/:companyId/notifications/:notificationId/mark-called",
  verifyFirebaseToken,
  authorizeCompanyAccess,
  markPatientCalled
);

export default router;
