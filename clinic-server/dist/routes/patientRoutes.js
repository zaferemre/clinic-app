"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyFirebaseToken_1 = require("../middlewares/verifyFirebaseToken");
const authorizeClinicAccess_1 = require("../middlewares/authorizeClinicAccess");
const patientController_1 = require("../controllers/patientController");
const Patient_1 = __importDefault(require("../models/Patient"));
const router = express_1.default.Router();
// POST /clinic/:clinicId/patients → create a new patient
router.post("/:clinicId/patients", verifyFirebaseToken_1.verifyFirebaseToken, authorizeClinicAccess_1.authorizeClinicAccess, patientController_1.createPatient);
// GET /clinic/:clinicId/patients → list all patients
router.get("/:clinicId/patients", verifyFirebaseToken_1.verifyFirebaseToken, authorizeClinicAccess_1.authorizeClinicAccess, patientController_1.getPatients);
// PATCH /clinic/:clinicId/patients/:patientId → update credit, name, etc.
router.patch("/:clinicId/patients/:patientId", verifyFirebaseToken_1.verifyFirebaseToken, authorizeClinicAccess_1.authorizeClinicAccess, patientController_1.updatePatient);
// PATCH /clinic/:clinicId/patients/:patientId/payment → record a payment
router.patch("/:clinicId/patients/:patientId/payment", verifyFirebaseToken_1.verifyFirebaseToken, authorizeClinicAccess_1.authorizeClinicAccess, patientController_1.recordPayment);
router.patch("/:clinicId/patients/:patientId/unpaid", verifyFirebaseToken_1.verifyFirebaseToken, async (req, res) => {
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
// GET /clinic/:clinicId/patients/:patientId/appointments → past visits
router.get("/:clinicId/patients/:patientId/appointments", verifyFirebaseToken_1.verifyFirebaseToken, authorizeClinicAccess_1.authorizeClinicAccess, patientController_1.getPatientAppointments);
// PATCH /clinic/:clinicId/patients/:patientId/flag-call → flag for call
router.patch("/:clinicId/patients/:patientId/flag-call", verifyFirebaseToken_1.verifyFirebaseToken, authorizeClinicAccess_1.authorizeClinicAccess, patientController_1.flagPatientCall);
router.get("/:clinicId/patients/:patientId", verifyFirebaseToken_1.verifyFirebaseToken, authorizeClinicAccess_1.authorizeClinicAccess, async (req, res) => {
    const { clinicId, patientId } = req.params;
    try {
        // Sadece ilgili klinikteki hasta
        const patient = await Patient_1.default.findOne({
            _id: patientId,
            clinicId,
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
exports.default = router;
