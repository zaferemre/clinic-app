import { RequestHandler } from "express";
import Patient from "../models/Patient";
import mongoose from "mongoose";
import Notification from "../models/Notification";
import Appointment from "../models/Appointment";

// 1) createPatient
export const createPatient: RequestHandler = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { name, gender, age, phone, services, paymentHistory, note } =
      req.body;

    const patient = new Patient({
      clinicId,
      name,
      gender,
      age,
      phone,
      credit: 0,
      services,
      paymentHistory: paymentHistory ?? [],
      note,
    });

    await patient.save();
    res.status(201).json(patient);
  } catch (err: any) {
    console.error("Error in createPatient:", err);
    res
      .status(400)
      .json({ error: "Failed to create patient", details: err.message });
  }
};

// 2) getPatients
export const getPatients: RequestHandler = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const patients = await Patient.find({ clinicId }).exec();
    res.status(200).json(patients);
  } catch (err: any) {
    console.error("Error in getPatients:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch patients", details: err.message });
  }
};

// 3) updatePatient
export const updatePatient: RequestHandler = async (req, res) => {
  try {
    const { clinicId, patientId } = req.params;
    if (!mongoose.isValidObjectId(patientId)) {
      res.status(400).json({ error: "Invalid patient ID" });
      return;
    }
    const patient = await Patient.findById(patientId).exec();
    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }
    if (patient.clinicId.toString() !== clinicId) {
      res.status(403).json({ error: "Patient does not belong to this clinic" });
      return;
    }

    const updates = req.body as Partial<{
      credit: number;
      name: string;
      age: number;
      phone: string;
      note: string;
    }>;
    const allowedFields = ["credit", "name", "age", "phone", "note"];
    for (const key of Object.keys(updates)) {
      if (!allowedFields.includes(key)) {
        res.status(400).json({ error: "Invalid field in update" });
        return;
      }
    }

    Object.assign(patient, updates);
    await patient.save();
    res.status(200).json(patient);
  } catch (err: any) {
    console.error("Error in updatePatient:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// 4) recordPayment (no balanceDue)
export const recordPayment: RequestHandler = async (req, res) => {
  try {
    const { clinicId, patientId } = req.params;
    if (!mongoose.isValidObjectId(patientId)) {
      res.status(400).json({ error: "Invalid patient ID" });
      return;
    }
    const patient = await Patient.findById(patientId).exec();
    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }
    if (patient.clinicId.toString() !== clinicId) {
      res.status(403).json({ error: "Patient does not belong to this clinic" });
      return;
    }

    const { method } = req.body;
    if (!method) {
      res.status(400).json({ error: "Payment method is required" });
      return;
    }

    // Append a new payment history entry with “now”
    patient.paymentHistory.push({
      date: new Date(),
      method,
      amount: req.body.amount || 0, // client can supply—but we decided “no date pick,” they can supply amount if needed
      note: req.body.note || "",
    });

    await patient.save();
    res.status(200).json(patient);
  } catch (err: any) {
    console.error("Error in recordPayment:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// 5) getPatientAppointments
export const getPatientAppointments: RequestHandler = async (req, res) => {
  try {
    const { clinicId, patientId } = req.params;
    if (!mongoose.isValidObjectId(patientId)) {
      res.status(400).json({ error: "Invalid patient ID" });
      return;
    }
    const patient = await Patient.findById(patientId).exec();
    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }
    if (patient.clinicId.toString() !== clinicId) {
      res.status(403).json({ error: "Patient does not belong to this clinic" });
      return;
    }

    const appointments = await Appointment.find({
      clinicId,
      patientId,
    })
      .sort({ start: -1 })
      .exec();

    // Return simplified appointment objects
    const simplified = appointments.map((appt) => ({
      id: appt._id,
      start: appt.start,
      end: appt.end,
      status: appt.status,
      workerEmail: appt.workerEmail,
    }));

    res.status(200).json(simplified);
  } catch (err: any) {
    console.error("Error in getPatientAppointments:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
export const flagPatientCall: RequestHandler = async (req, res) => {
  try {
    const { clinicId, patientId } = req.params;
    if (!mongoose.isValidObjectId(patientId)) {
      res.status(400).json({ error: "Invalid patient ID" });
      return;
    }
    const patient = await Patient.findById(patientId).exec();
    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }
    if (patient.clinicId.toString() !== clinicId) {
      res.status(403).json({ error: "Patient does not belong to this clinic" });
      return;
    }

    // Prevent duplicate “pending” notifications for the same patient
    const existing = await Notification.findOne({
      clinicId,
      patientId,
      type: "call",
      status: "pending",
    }).exec();
    if (existing) {
      res.status(409).json({ error: "Patient is already flagged for calling" });
      return;
    }

    const workerEmail = (req as any).user?.email as string;
    const notif = new Notification({
      clinicId,
      patientId,
      type: "call",
      status: "pending",
      workerEmail,
    });
    await notif.save();
    res.status(201).json({
      id: notif._id.toString(),
      patientId: notif.patientId,
      patientName: patient.name,
      createdAt: notif.createdAt.toISOString(),
      isCalled: false,
    });
  } catch (err: any) {
    console.error("Error in flagPatientCall:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

/**
 * 7) getNotifications (only pending “call” notifications)
 *
 *    Now returns exactly:
 *      - id: string
 *      - patientId: { _id: string; name: string }
 *      - patientName: string
 *      - createdAt: string (ISO)
 *      - isCalled: boolean
 */
export const getNotifications: RequestHandler = async (req, res) => {
  try {
    const { clinicId } = req.params;
    // Find only “call” notifications that are still pending
    const notifications = await Notification.find({
      clinicId,
      type: "call",
      status: "pending",
    })
      .populate("patientId", "name")
      .exec();

    // Map to an object shape the frontend expects
    const simple = notifications.map((n) => ({
      id: n._id.toString(),
      patientId: {
        _id: (n.patientId as any)._id.toString(),
        name: (n.patientId as any).name as string,
      },
      patientName: (n.patientId as any).name as string,
      createdAt: n.createdAt.toISOString(),
      isCalled: n.status === "done", // pending => false
    }));

    res.status(200).json(simple);
  } catch (err: any) {
    console.error("Error in getNotifications:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

/**
 * 8) markPatientCalled (set status = “done”)
 */
export const markPatientCalled: RequestHandler = async (req, res) => {
  try {
    const { clinicId, notificationId } = req.params;
    if (!mongoose.isValidObjectId(notificationId)) {
      res.status(400).json({ error: "Invalid notification ID" });
      return;
    }
    const notif = await Notification.findById(notificationId).exec();
    if (!notif) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }
    if (notif.clinicId.toString() !== clinicId) {
      res
        .status(403)
        .json({ error: "Notification does not belong to this clinic" });
      return;
    }

    notif.status = "done";
    await notif.save();
    res.status(200).json({ message: "Notification marked done" });
  } catch (err: any) {
    console.error("Error in markPatientCalled:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
