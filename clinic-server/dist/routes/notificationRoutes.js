"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyFirebaseToken_1 = require("../middlewares/verifyFirebaseToken");
const authorizeCompanyAccess_1 = require("../middlewares/authorizeCompanyAccess");
const patientController_1 = require("../controllers/patientController");
const router = express_1.default.Router();
router.use("/:companyId", verifyFirebaseToken_1.verifyFirebaseToken, authorizeCompanyAccess_1.authorizeCompanyAccess);
// GET /Company/:companyId/notifications
router.get("/:companyId/notifications", patientController_1.getNotifications);
// PATCH /Company/:companyId/notifications/:notificationId/mark-called
router.patch("/:companyId/notifications/:notificationId/mark-called", patientController_1.markPatientCalled);
exports.default = router;
