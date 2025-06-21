// src/routes/roleRoutes.ts
import { Router } from "express";
import * as roleCtrl from "../controllers/roleController";
const router = Router({ mergeParams: true });

router.get("/", roleCtrl.listRoles);
router.post("/", roleCtrl.addRole);
router.patch("/:roleId", roleCtrl.updateRole);
router.delete("/:roleId", roleCtrl.deleteRole);

export default router;
