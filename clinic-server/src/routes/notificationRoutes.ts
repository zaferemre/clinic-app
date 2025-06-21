// src/routes/notificationRoutes.ts
import { Router } from "express";
import * as notifCtrl from "../controllers/notificationController";
const router = Router({ mergeParams: true });

router.get("/", notifCtrl.getNotifications);
router.patch("/:notificationId/done", notifCtrl.markNotificationDone);

export default router;
