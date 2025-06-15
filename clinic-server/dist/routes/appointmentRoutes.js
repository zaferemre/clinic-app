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
// require token + access for any :companyId
router.use("/:companyId", verifyFirebaseToken_1.verifyFirebaseToken, authorizeCompanyAccess_1.authorizeCompanyAccess);
router.get("/:companyId/appointments", appointmentController_1.getAppointments);
router.get("/:companyId/appointments/:appointmentId", appointmentController_1.getAppointmentById);
router.post("/:companyId/appointments", appointmentController_1.createAppointment);
router.put("/:companyId/appointments/:appointmentId", appointmentController_1.updateAppointment);
router.patch("/:companyId/appointments/:appointmentId", appointmentController_1.updateAppointment);
router.delete("/:companyId/appointments/:appointmentId", appointmentController_1.deleteAppointment);
exports.default = router;
