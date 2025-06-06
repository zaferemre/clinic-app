import { RequestHandler } from "express";
import Appointment from "../models/Appointment";
import Patient from "../models/Patient";
import mongoose from "mongoose";

export const getAppointments: RequestHandler = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const appointments = await Appointment.find({ clinicId })
      .populate("patientId", "name")
      .exec();

    const events = appointments.map((appt) => ({
      id: appt._id,
      title: (appt.patientId as any).name,
      start: appt.start,
      end: appt.end,
      color:
        appt.status === "done"
          ? "#6b7280"
          : appt.status === "cancelled"
          ? "#ef4444"
          : "#3b82f6",
      workerEmail: appt.workerEmail,
    }));

    res.status(200).json(events);
  } catch (err: any) {
    console.error("Error in getAppointments:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

export const createAppointment: RequestHandler = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { patientId, workerEmail, start, end } = req.body as {
      patientId: string;
      workerEmail: string;
      start: string;
      end: string;
    };

    // 1) Verify patient
    const patient = await Patient.findById(patientId).exec();
    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }
    if (patient.clinicId.toString() !== clinicId) {
      res.status(403).json({ error: "Patient does not belong to this clinic" });
      return;
    }

    // 2) Verify workerEmail belongs to clinic
    const clinic = (req as any).clinic; // set by authorizeClinicAccess
    if (
      clinic.workerEmail !== workerEmail &&
      !clinic.workers.find((w: any) => w.email === workerEmail)
    ) {
      res.status(400).json({ error: "Worker does not belong to this clinic" });
      return;
    }

    // 3) Check credit
    if (patient.credit < 1) {
      res.status(400).json({
        error: "Insufficient credit. Please update patient credit first.",
      });
      return;
    }

    // 4) Check overlapping
    const newStart = new Date(start);
    const newEnd = new Date(end);
    const overlap = await Appointment.findOne({
      clinicId,
      workerEmail,
      $or: [{ start: { $lt: newEnd }, end: { $gt: newStart } }],
    }).exec();
    if (overlap) {
      res
        .status(409)
        .json({ error: "This timeslot is already taken for that worker." });
      return;
    }

    // 5) Deduct credit now
    patient.credit -= 1;
    await patient.save();

    // 6) Create appointment
    const newAppt = new Appointment({
      clinicId,
      patientId,
      workerEmail,
      start: newStart,
      end: newEnd,
    });
    await newAppt.save();
    res.status(201).json(newAppt);
  } catch (err: any) {
    console.error("Error in createAppointment:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

export const completeAppointment: RequestHandler = async (req, res) => {
  try {
    const { clinicId, appointmentId } = req.params;
    if (!mongoose.isValidObjectId(appointmentId)) {
      res.status(400).json({ error: "Invalid appointment ID" });
      return;
    }
    const appt = await Appointment.findById(appointmentId).exec();
    if (!appt) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }
    if (appt.clinicId.toString() !== clinicId) {
      res
        .status(403)
        .json({ error: "Appointment does not belong to this clinic" });
      return;
    }
    if (appt.status !== "scheduled") {
      res
        .status(400)
        .json({ error: "Only scheduled appts can be marked as done." });
      return;
    }

    appt.status = "done";
    await appt.save();
    res.status(200).json({ message: "Appointment marked done." });
  } catch (err: any) {
    console.error("Error in completeAppointment:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
