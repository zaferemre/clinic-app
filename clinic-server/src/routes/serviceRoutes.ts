import { Router } from "express";
import * as serviceCtrl from "../controllers/serviceController";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";

const router = Router({ mergeParams: true });
router.use(verifyFirebaseToken);

router.get("/", serviceCtrl.listServices);
router.post("/", serviceCtrl.createService);
router.patch("/:serviceId", serviceCtrl.updateService);
router.delete("/:serviceId", serviceCtrl.deleteService);

export default router;
