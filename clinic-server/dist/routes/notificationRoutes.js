"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyFirebaseToken_1 = require("../middlewares/verifyFirebaseToken");
const authorizeClinicAccess_1 = require("../middlewares/authorizeClinicAccess");
const patientController_1 = require("../controllers/patientController");
const router = express_1.default.Router();
// GET /clinic/:clinicId/notifications
router.get("/:clinicId/notifications", verifyFirebaseToken_1.verifyFirebaseToken, authorizeClinicAccess_1.authorizeClinicAccess, patientController_1.getNotifications);
// PATCH /clinic/:clinicId/notifications/:notificationId/mark-called
router.patch("/:clinicId/notifications/:notificationId/mark-called", verifyFirebaseToken_1.verifyFirebaseToken, authorizeClinicAccess_1.authorizeClinicAccess, patientController_1.markPatientCalled);
exports.default = router;
