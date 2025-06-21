// src/routes/employeeRoutes.ts
import { Router } from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";

import * as empCtrl from "../controllers/employeeController";
const router = Router({ mergeParams: true });
router.use(verifyFirebaseToken);
router.get("/", empCtrl.listEmployees);
router.post("/", empCtrl.addEmployee);
router.patch("/:employeeId", empCtrl.updateEmployee);
router.delete("/:employeeId", empCtrl.deleteEmployee);

export default router;
