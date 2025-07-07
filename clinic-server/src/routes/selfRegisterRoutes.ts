// src/routes/selfRegisterRoutes.ts
import { Router } from "express";
import { selfRegisterPatient } from "../controllers/selfRegisterController";

const router = Router({ mergeParams: true });

router.post("/:companyId/:clinicId/:token", selfRegisterPatient);

export default router;
