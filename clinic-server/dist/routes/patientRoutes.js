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
// require token + access for any :companyId
router.use("/:companyId", verifyFirebaseToken_1.verifyFirebaseToken, authorizeCompanyAccess_1.authorizeCompanyAccess);
router.post("/:companyId/patients", patientController_1.createPatient);
router.get("/:companyId/patients", patientController_1.getPatients);
router.patch("/:companyId/patients/:patientId", patientController_1.updatePatient);
router.patch("/:companyId/patients/:patientId/payment", patientController_1.recordPayment);
router.patch("/:companyId/patients/:patientId/flag-call", patientController_1.flagPatientCall);
router.get("/:companyId/patients/:patientId/appointments", patientController_1.getPatientAppointments);
router.delete("/:companyId/patients/:patientId", patientController_1.deletePatient);
exports.default = router;
