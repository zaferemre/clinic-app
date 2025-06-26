import { Router } from "express";
import * as notifCtrl from "../controllers/notificationController";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";

const router = Router({ mergeParams: true });
router.use(verifyFirebaseToken);

router.get("/", notifCtrl.listNotifications);
router.patch("/:notificationId/done", notifCtrl.markNotificationDone);
router.post("/", notifCtrl.createNotification);
export default router;
