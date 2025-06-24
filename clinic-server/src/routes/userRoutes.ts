import { Router } from "express";
import * as userCtrl from "../controllers/userController";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";

const router = Router();

// All /user/* routes require a valid Firebase token
router.use(verifyFirebaseToken);

// 1) New: user must explicitly register
router.post("/register", userCtrl.registerUser);

// 2) Existing profile endpoints
router.get("/me", userCtrl.getMe);
router.patch("/me", userCtrl.updateMe);
router.post("/register", userCtrl.registerUser); // This is for creating a new user profile if not registered
router.get("/me/companies", userCtrl.listUserCompanies);
router.get("/me/clinics", userCtrl.listUserClinics);
router.delete("/me", userCtrl.deleteUserAccount);
router.post("/membership", userCtrl.addMembership);
export default router;
