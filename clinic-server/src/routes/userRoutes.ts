// src/routes/userRoutes.ts

import { Router } from "express";
import * as userCtrl from "../controllers/userController";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";

const router = Router();

// All /user/* routes require a valid Firebase token
router.use(verifyFirebaseToken);

router.get("/me", userCtrl.getMe);
router.patch("/me", userCtrl.updateMe);
router.post("/register", userCtrl.registerUser);
router.get("/me/companies", userCtrl.listUserCompanies);
router.get("/me/clinics", userCtrl.listUserClinics);
router.delete("/me", userCtrl.deleteUserAccount);
router.post("/membership", userCtrl.addMembership);
router.get("/appointments", userCtrl.listAllAppointmentsForMe);

// Push Token API
router.post("/:uid/push-token", userCtrl.addPushToken);
router.delete("/:uid/push-token", userCtrl.removePushToken);
router.put("/:uid/push-tokens", userCtrl.setPushTokens);
router.get("/:uid/push-tokens", userCtrl.getPushTokens);

export default router;
