// src/controllers/patientController.ts

import { RequestHandler } from "express";
import Patient from "../models/Patient";

// 1) createPatient: creates a new patient under a clinic
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
      credit: 0, // default credit
      balanceDue: 0, // default balance
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

// 2) getPatients: lists all patients for a clinic
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

// 3) updatePatient: PATCH a patient's credit, balanceDue, or other basic fields
export const updatePatient: RequestHandler = async (req, res) => {
  try {
    const { patientId } = req.params;
    const updates = req.body as Partial<{
      credit: number;
      balanceDue: number;
      name: string;
      age: number;
      phone: string;
      note: string;
    }>;

    // Allow only specific fields
    const allowedFields = [
      "credit",
      "balanceDue",
      "name",
      "age",
      "phone",
      "note",
    ];
    for (const key of Object.keys(updates)) {
      if (!allowedFields.includes(key)) {
        res.status(400).json({ error: "Invalid field in update" });
        return;
      }
    }

    const patient = await Patient.findById(patientId).exec();
    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }

    Object.assign(patient, updates);
    await patient.save();
    res.status(200).json(patient);
    return;
  } catch (err: any) {
    console.error("Error in updatePatient:", err);
    res.status(500).json({ error: "Server error", details: err.message });
    return;
  }
};

// 4) recordPayment: records a payment for a patient and clears their balanceDue
export const recordPayment: RequestHandler = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await Patient.findById(patientId).exec();
    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }

    const amount = patient.balanceDue;
    if (amount <= 0) {
      res.status(400).json({ error: "No balance to pay" });
      return;
    }

    // Append a new payment history entry
    const { method } = req.body;
    if (!method) {
      res.status(400).json({ error: "Payment method is required" });
      return;
    }
    patient.paymentHistory.push({
      date: new Date(),
      method,
      amount,
      note: "",
    });
    patient.balanceDue = 0;
    await patient.save();
    res.status(200).json(patient);
    return;
  } catch (err: any) {
    console.error("Error in recordPayment:", err);
    res.status(500).json({ error: "Server error", details: err.message });
    return;
  }
};
