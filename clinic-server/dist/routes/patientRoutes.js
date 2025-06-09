"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyFirebaseToken_1 = require("../middlewares/verifyFirebaseToken");
const authorizeCompanyAccess_1 = require("../middlewares/authorizeCompanyAccess");
const patientController_1 = require("../controllers/patientController");
const Patient_1 = __importDefault(require("../models/Patient"));
const router = express_1.default.Router();
// POST /Company/:companyId/patients → create a new patient
router.post("/:companyId/patients", verifyFirebaseToken_1.verifyFirebaseToken, authorizeCompanyAccess_1.authorizeCompanyAccess, patientController_1.createPatient);
// GET /Company/:companyId/patients → list all patients
router.get("/:companyId/patients", verifyFirebaseToken_1.verifyFirebaseToken, authorizeCompanyAccess_1.authorizeCompanyAccess, patientController_1.getPatients);
// PATCH /Company/:companyId/patients/:patientId → update credit, name, etc.
router.patch("/:companyId/patients/:patientId", verifyFirebaseToken_1.verifyFirebaseToken, authorizeCompanyAccess_1.authorizeCompanyAccess, patientController_1.updatePatient);
// PATCH /Company/:companyId/patients/:patientId/payment → record a payment
router.patch("/:companyId/patients/:patientId/payment", verifyFirebaseToken_1.verifyFirebaseToken, authorizeCompanyAccess_1.authorizeCompanyAccess, patientController_1.recordPayment);
router.patch("/:companyId/patients/:patientId/unpaid", verifyFirebaseToken_1.verifyFirebaseToken, async (req, res) => {
    const { patientId } = req.params;
    try {
        const patient = await Patient_1.default.findById(patientId).exec();
        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }
        // Append an “Unpaid” entry with amount 0
        patient.paymentHistory.push({
            date: new Date(),
            method: "Unpaid",
            amount: 0,
            note: "",
        });
        await patient.save();
        res.status(200).json(patient);
    }
    catch (err) {
        console.error("Error marking unpaid:", err);
        res.status(500).json({ error: "Server error" });
    }
});
// GET /Company/:companyId/patients/:patientId/appointments → past visits
router.get("/:companyId/patients/:patientId/appointments", verifyFirebaseToken_1.verifyFirebaseToken, authorizeCompanyAccess_1.authorizeCompanyAccess, patientController_1.getPatientAppointments);
// PATCH /Company/:companyId/patients/:patientId/flag-call → flag for call
router.patch("/:companyId/patients/:patientId/flag-call", verifyFirebaseToken_1.verifyFirebaseToken, authorizeCompanyAccess_1.authorizeCompanyAccess, patientController_1.flagPatientCall);
router.get("/:companyId/patients/:patientId", verifyFirebaseToken_1.verifyFirebaseToken, authorizeCompanyAccess_1.authorizeCompanyAccess, async (req, res) => {
    const { companyId, patientId } = req.params;
    try {
        // Sadece ilgili klinikteki hasta
        const patient = await Patient_1.default.findOne({
            _id: patientId,
            companyId,
        }).exec();
        if (!patient) {
            res.status(404).json({ error: "Hasta bulunamadı" });
            return;
        }
        res.status(200).json(patient);
        return;
    }
    catch (err) {
        console.error("Error fetching single patient:", err);
        res.status(500).json({ error: "Sunucu hatası", details: err.message });
        return;
    }
});
router.delete("/:companyId/patients/:patientId", patientController_1.deletePatient);
exports.default = router;
