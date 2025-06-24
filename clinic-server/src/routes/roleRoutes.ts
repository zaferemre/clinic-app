import { Router } from "express";
import * as roleCtrl from "../controllers/roleController";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";

const router = Router({ mergeParams: true });
router.use(verifyFirebaseToken);

router.get("/", roleCtrl.listRoles);
router.post("/", roleCtrl.addRole);
router.patch("/:roleId", roleCtrl.updateRole);
router.delete("/:roleId", roleCtrl.deleteRole);

export default router;
