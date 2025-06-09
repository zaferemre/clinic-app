import express from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeCompanyAccess } from "../middlewares/authorizeCompanyAccess";
import {
  createPatient,
  getPatients,
  updatePatient,
  recordPayment,
  getPatientAppointments,
  flagPatientCall,
  deletePatient,
} from "../controllers/patientController";
import Patient from "../models/Patient";

const router = express.Router();

// POST /Company/:companyId/patients → create a new patient
router.post(
  "/:companyId/patients",
  verifyFirebaseToken,
  authorizeCompanyAccess,
  createPatient
);

// GET /Company/:companyId/patients → list all patients
router.get(
  "/:companyId/patients",
  verifyFirebaseToken,
  authorizeCompanyAccess,
  getPatients
);

// PATCH /Company/:companyId/patients/:patientId → update credit, name, etc.
router.patch(
  "/:companyId/patients/:patientId",
  verifyFirebaseToken,
  authorizeCompanyAccess,
  updatePatient
);

// PATCH /Company/:companyId/patients/:patientId/payment → record a payment
router.patch(
  "/:companyId/patients/:patientId/payment",
  verifyFirebaseToken,
  authorizeCompanyAccess,
  recordPayment
);
router.patch(
  "/:companyId/patients/:patientId/unpaid",
  verifyFirebaseToken,
  async (req, res) => {
    const { patientId } = req.params;
    try {
      const patient = await Patient.findById(patientId).exec();
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
    } catch (err: any) {
      console.error("Error marking unpaid:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// GET /Company/:companyId/patients/:patientId/appointments → past visits
router.get(
  "/:companyId/patients/:patientId/appointments",
  verifyFirebaseToken,
  authorizeCompanyAccess,
  getPatientAppointments
);

// PATCH /Company/:companyId/patients/:patientId/flag-call → flag for call
router.patch(
  "/:companyId/patients/:patientId/flag-call",
  verifyFirebaseToken,
  authorizeCompanyAccess,
  flagPatientCall
);

router.get(
  "/:companyId/patients/:patientId",
  verifyFirebaseToken,
  authorizeCompanyAccess,
  async (req, res) => {
    const { companyId, patientId } = req.params;
    try {
      // Sadece ilgili klinikteki hasta
      const patient = await Patient.findOne({
        _id: patientId,
        companyId,
      }).exec();
      if (!patient) {
        res.status(404).json({ error: "Hasta bulunamadı" });
        return;
      }
      res.status(200).json(patient);
      return;
    } catch (err: any) {
      console.error("Error fetching single patient:", err);
      res.status(500).json({ error: "Sunucu hatası", details: err.message });
      return;
    }
  }
);
router.delete("/:companyId/patients/:patientId", deletePatient);
export default router;
