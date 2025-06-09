import express from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeCompanyAccess } from "../middlewares/authorizeCompanyAccess";
import {
  getNotifications,
  markPatientCalled,
} from "../controllers/patientController";

const router = express.Router();
router.use("/:companyId", verifyFirebaseToken, authorizeCompanyAccess);

// GET /Company/:companyId/notifications
router.get(
  "/:companyId/notifications",

  getNotifications
);

// PATCH /Company/:companyId/notifications/:notificationId/mark-called
router.patch(
  "/:companyId/notifications/:notificationId/mark-called",

  markPatientCalled
);

export default router;
