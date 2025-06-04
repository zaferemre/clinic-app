import { Router, Request, Response, NextFunction } from "express";
import Appointment from "../models/Appointment";
import Patient from "../models/Patient";

const router = Router();

// GET all appointments for a clinic (populate patient name)
router.get(
  "/:clinicId/appointments",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { clinicId } = req.params;
      const appointments = await Appointment.find({ clinicId })
        .populate("patientId", "name")
        .exec();

      // Transform into FullCalendar-friendly event objects:
      const events = appointments.map((appt) => ({
        id: appt._id,
        title: (appt.patientId as any).name,
        start: appt.start,
        end: appt.end,
        color:
          appt.status === "done"
            ? "#6b7280" // gray if done
            : appt.status === "cancelled"
            ? "#ef4444" // red if cancelled
            : "#3b82f6", // blue if scheduled
      }));

      res.status(200).json(events);
      return;
    } catch (err: any) {
      console.error("Error GET /appointments:", err);
      res.status(500).json({ error: "Server error", details: err.message });
      return;
    }
  }
);

// POST schedule new appointment
router.post(
  "/:clinicId/appointments",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { clinicId } = req.params;
      const { patientId, start, end } = req.body as {
        patientId: string;
        start: string;
        end: string;
      };

      // 1) Find patient and check credit
      const patient = await Patient.findById(patientId).exec();
      if (!patient) {
        res.status(404).json({ error: "Patient not found" });
        return;
      }
      if (patient.credit < 1) {
        res.status(400).json({
          error: "Insufficient credit. Please update patient credit first.",
        });
        return;
      }

      // 2) Create appointment with status “scheduled”
      const newAppt = new Appointment({
        clinicId,
        patientId,
        start: new Date(start),
        end: new Date(end),
      });
      const saved = await newAppt.save();

      res.status(201).json(saved);
      return;
    } catch (err: any) {
      console.error("Error POST /appointments:", err);
      res.status(500).json({ error: "Server error", details: err.message });
      return;
    }
  }
);

// PATCH mark appointment as done (deduct 1 credit from patient)
router.patch(
  "/:clinicId/appointments/:appointmentId/complete",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { appointmentId } = req.params;
      const appt = await Appointment.findById(appointmentId).exec();
      if (!appt) {
        res.status(404).json({ error: "Appointment not found" });
        return;
      }
      if (appt.status !== "scheduled") {
        res
          .status(400)
          .json({ error: "Only scheduled appts can be marked as done." });
        return;
      }

      // 1) Deduct credit from patient
      const patient = await Patient.findById(appt.patientId).exec();
      if (!patient) {
        res.status(404).json({ error: "Patient not found" });
        return;
      }
      if (patient.credit < 1) {
        res.status(400).json({ error: "Patient has no credit to deduct." });
        return;
      }
      patient.credit -= 1;
      await patient.save();

      // 2) Update appointment status
      appt.status = "done";
      await appt.save();

      res.status(200).json({ message: "Appointment marked done." });
      return;
    } catch (err: any) {
      console.error("Error PATCH /appointments/complete:", err);
      res.status(500).json({ error: "Server error", details: err.message });
      return;
    }
  }
);

export default router;
