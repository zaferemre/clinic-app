"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyFirebaseToken_1 = require("../middlewares/verifyFirebaseToken");
const authorizeCompanyAccess_1 = require("../middlewares/authorizeCompanyAccess");
const appointmentController_1 = require("../controllers/appointmentController");
const router = express_1.default.Router();
// All routes require a valid Firebase token + company access
router.use("/:companyId", verifyFirebaseToken_1.verifyFirebaseToken, authorizeCompanyAccess_1.authorizeCompanyAccess);
/**
 * GET   /company/:companyId/appointments
 * POST  /company/:companyId/appointments
 * PATCH /company/:companyId/appointments/:appointmentId/complete
 */
router.get("/:companyId/appointments", appointmentController_1.getAppointments);
router.post("/:companyId/appointments", appointmentController_1.createAppointment);
router.delete("/:companyId/appointments/:appointmentId", appointmentController_1.deleteAppointment);
router.put("/:companyId/appointments/:appointmentId", appointmentController_1.updateAppointment);
router.patch("/:companyId/appointments/:appointmentId", appointmentController_1.updateAppointment);
exports.default = router;
