"use strict";
// src/routes/employeeRoutes.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const empCtrl = __importStar(require("../controllers/employeeController"));
const verifyFirebaseToken_1 = require("../middlewares/verifyFirebaseToken");
const apptCtrl = __importStar(require("../controllers/appointmentController"));
const router = (0, express_1.Router)({ mergeParams: true });
// All routes below require authentication!
router.use(verifyFirebaseToken_1.verifyFirebaseToken);
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
// Busy slots endpoint
router.get("/:employeeId/busy", apptCtrl.getEmployeeBusySlots);
/**
 * ADMIN/INTERNAL PANEL ROUTES (optional, not required for typical app usage):
 * - /employees/...
 */
// Update employee by employeeId (admin only)
router.patch("/:employeeId", empCtrl.updateEmployee);
// Delete employee by employeeId (admin only)
router.delete("/:employeeId", empCtrl.deleteEmployee);
exports.default = router;
