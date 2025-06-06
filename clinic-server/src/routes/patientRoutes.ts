import express from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeClinicAccess } from "../middlewares/authorizeClinicAccess";
import {
  createPatient,
  getPatients,
  updatePatient,
  recordPayment,
  getPatientAppointments,
  flagPatientCall,
} from "../controllers/patientController";
import Patient from "../models/Patient";

const router = express.Router();

// POST /clinic/:clinicId/patients → create a new patient
router.post(
  "/:clinicId/patients",
  verifyFirebaseToken,
  authorizeClinicAccess,
  createPatient
);

// GET /clinic/:clinicId/patients → list all patients
router.get(
  "/:clinicId/patients",
  verifyFirebaseToken,
  authorizeClinicAccess,
  getPatients
);

// PATCH /clinic/:clinicId/patients/:patientId → update credit, name, etc.
router.patch(
  "/:clinicId/patients/:patientId",
  verifyFirebaseToken,
  authorizeClinicAccess,
  updatePatient
);

// PATCH /clinic/:clinicId/patients/:patientId/payment → record a payment
router.patch(
  "/:clinicId/patients/:patientId/payment",
  verifyFirebaseToken,
  authorizeClinicAccess,
  recordPayment
);
router.patch(
  "/:clinicId/patients/:patientId/unpaid",
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

// GET /clinic/:clinicId/patients/:patientId/appointments → past visits
router.get(
  "/:clinicId/patients/:patientId/appointments",
  verifyFirebaseToken,
  authorizeClinicAccess,
  getPatientAppointments
);

// PATCH /clinic/:clinicId/patients/:patientId/flag-call → flag for call
router.patch(
  "/:clinicId/patients/:patientId/flag-call",
  verifyFirebaseToken,
  authorizeClinicAccess,
  flagPatientCall
);

router.get(
  "/:clinicId/patients/:patientId",
  verifyFirebaseToken,
  authorizeClinicAccess,
  async (req, res) => {
    const { clinicId, patientId } = req.params;
    try {
      // Sadece ilgili klinikteki hasta
      const patient = await Patient.findOne({
        _id: patientId,
        clinicId,
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

export default router;
