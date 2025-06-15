import express from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeCompanyAccess } from "../middlewares/authorizeCompanyAccess";
import {
  getNotifications,
  markPatientCalled,
} from "../controllers/notificationController";

const router = express.Router();

// require token + access for any :companyId
router.use("/:companyId", verifyFirebaseToken, authorizeCompanyAccess);

router.get("/:companyId/notifications", getNotifications);
router.patch(
  "/:companyId/notifications/:notificationId/mark-called",
  markPatientCalled
);

export default router;
