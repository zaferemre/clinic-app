// src/routes/employeeRoutes.ts

import { Router } from "express";
import * as empCtrl from "../controllers/employeeController";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";

const router = Router({ mergeParams: true });

// All routes below require authentication!
router.use(verifyFirebaseToken);

/**
 * APP CLIENT ROUTES (recommend using these in your app):
 * - /company/:companyId/clinics/:clinicId/employees/...
 */

// List all employees (optionally filter by clinic)
router.get("/", empCtrl.listEmployees);

// Upsert (create or update) employee by userUid
router.post("/upsert", empCtrl.upsertEmployee);

// Remove employee by userUid
router.delete("/remove/:userUid", empCtrl.removeEmployee);

/**
 * ADMIN/INTERNAL PANEL ROUTES (optional, not required for typical app usage):
 * - /employees/...
 */

// Update employee by employeeId (admin only)
router.patch("/:employeeId", empCtrl.updateEmployee);

// Delete employee by employeeId (admin only)
router.delete("/:employeeId", empCtrl.deleteEmployee);

export default router;
