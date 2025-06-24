import { Router } from "express";
import * as empCtrl from "../controllers/employeeController";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";

const router = Router({ mergeParams: true });
router.use(verifyFirebaseToken);

// Flexible (recommended for app)
router.get("/", empCtrl.listEmployees);
router.post("/upsert", empCtrl.upsertEmployee);
router.delete("/remove/:userUid", empCtrl.removeEmployee);

// Admin CRUD (optional)
router.post("/", empCtrl.addEmployee);
router.patch("/:employeeId", empCtrl.updateEmployee);
router.delete("/:employeeId", empCtrl.deleteEmployee);

export default router;
