import { RequestHandler } from "express";
import mongoose from "mongoose";
import Appointment from "../models/Appointment";
import Patient from "../models/Patient";
import { ICompany } from "../models/Company";

// GET /company/:companyId/appointments
export const getAppointments: RequestHandler = async (req, res) => {
  try {
    const { companyId } = req.params;
    const appointments = await Appointment.find({ companyId })
      .populate("patientId", "name")
      .exec();

    const events = appointments.map((appt) => ({
      id: appt._id.toString(),
      title: (appt.patientId as any)?.name ?? "Bilinmeyen Hasta",
      start: appt.start,
      end: appt.end,
      extendedProps: {
        employeeEmail: appt.employeeEmail,
        serviceId: appt.serviceId?.toString?.() ?? null,
      },
      color:
        appt.status === "done"
          ? "#6b7280"
          : appt.status === "cancelled"
          ? "#ef4444"
          : "#3b82f6",
    }));

    res.status(200).json(events);
  } catch (err: any) {
    console.error("Error in getAppointments:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// POST /company/:companyId/appointments
export const createAppointment: RequestHandler = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { patientId, employeeEmail, serviceId, start, end } = req.body;

    const newStart = new Date(start);
    const newEnd = new Date(end);
    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
      return res.status(400).json({ error: "Invalid start or end datetime" });
    }

    const patient = await Patient.findById(patientId).exec();
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    if (patient.companyId.toString() !== companyId)
      return res.status(403).json({ error: "Patient not in this company" });

    const company = (req as any).company as ICompany;
    const isOwner = company.ownerEmail === employeeEmail;
    const isEmployee =
      Array.isArray(company.employees) &&
      company.employees.some((e) => e.email === employeeEmail);
    if (!isOwner && !isEmployee)
      return res.status(400).json({ error: "Employee not in company" });

    if (patient.credit < 1)
      return res.status(400).json({ error: "Insufficient credit" });

    const overlap = await Appointment.findOne({
      companyId,
      employeeEmail,
      $or: [
        { start: { $lt: newEnd, $gte: newStart } },
        { end: { $gt: newStart, $lte: newEnd } },
        { start: { $lte: newStart }, end: { $gte: newEnd } },
      ],
    }).exec();

    if (overlap)
      return res.status(409).json({ error: "That timeslot is already taken." });

    patient.credit -= 1;
    await patient.save();

    const newAppt = new Appointment({
      companyId,
      patientId,
      employeeEmail,
      serviceId,
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

// DELETE /company/:companyId/appointments/:appointmentId
export const deleteAppointment: RequestHandler = async (req, res) => {
  try {
    const { companyId, appointmentId } = req.params;

    const appt = await Appointment.findOne({ _id: appointmentId, companyId });
    if (!appt) return res.status(404).json({ error: "Appointment not found" });

    // Refund 1 credit back to patient
    const patient = await Patient.findById(appt.patientId);
    if (patient) {
      patient.credit += 1;
      await patient.save();
    }

    await appt.deleteOne();
    res.status(204).send();
  } catch (err: any) {
    console.error("Error in deleteAppointment:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// PUT /company/:companyId/appointments/:appointmentId
export const updateAppointment: RequestHandler = async (req, res) => {
  try {
    const { companyId, appointmentId } = req.params;
    const { start, end, serviceId, employeeEmail } = req.body;

    const appt = await Appointment.findOne({ _id: appointmentId, companyId });
    if (!appt) return res.status(404).json({ error: "Appointment not found" });

    const newStart = new Date(start);
    const newEnd = new Date(end);
    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime()))
      return res.status(400).json({ error: "Invalid date format" });

    appt.start = newStart;
    appt.end = newEnd;
    if (serviceId) appt.serviceId = serviceId;
    if (employeeEmail) appt.employeeEmail = employeeEmail;

    await appt.save();
    res.status(200).json(appt);
  } catch (err: any) {
    console.error("Error in updateAppointment:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
