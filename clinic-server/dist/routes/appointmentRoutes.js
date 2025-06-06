"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyFirebaseToken_1 = require("../middlewares/verifyFirebaseToken");
const authorizeClinicAccess_1 = require("../middlewares/authorizeClinicAccess");
const appointmentController_1 = require("../controllers/appointmentController");
const router = express_1.default.Router();
// GET /clinic/:clinicId/appointments
router.get("/:clinicId/appointments", verifyFirebaseToken_1.verifyFirebaseToken, authorizeClinicAccess_1.authorizeClinicAccess, appointmentController_1.getAppointments);
// POST /clinic/:clinicId/appointments
router.post("/:clinicId/appointments", verifyFirebaseToken_1.verifyFirebaseToken, authorizeClinicAccess_1.authorizeClinicAccess, appointmentController_1.createAppointment);
// PATCH /clinic/:clinicId/appointments/:appointmentId/complete
router.patch("/:clinicId/appointments/:appointmentId/complete", verifyFirebaseToken_1.verifyFirebaseToken, authorizeClinicAccess_1.authorizeClinicAccess, appointmentController_1.completeAppointment);
exports.default = router;
