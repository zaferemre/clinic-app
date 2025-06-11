import { RequestHandler } from "express";
import Appointment from "../models/Appointment";
import Patient from "../models/Patient";
import { CompanyDoc } from "../models/Company";

// src/controllers/appointmentController.ts

export const getAppointments: RequestHandler = async (req, res) => {
  try {
    const { companyId } = req.params;
    const appointments = await Appointment.find({ companyId })
      .populate("patientId", "name")
      .populate("serviceId", "serviceName")
      .exec();

    const events = appointments.map((appt) => ({
      id: appt._id.toString(),
      title: appt.patientId?.name ?? "Randevu",
      start: appt.start,
      end: appt.end,
      extendedProps: {
        employeeEmail: appt.employeeEmail ?? "",
        serviceId: appt.serviceId ? appt.serviceId.toString() : "",
      },

      // Extract color logic to a variable for clarity
      color: (() => {
        if (appt.status === "done") return "#6b7280";
        if (appt.status === "cancelled") return "#ef4444";
        return "#3b82f6";
      })(),
    }));

    res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ error: "Failed to fetch appointments." });
  }
};

export const createAppointment: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { companyId } = req.params;
    const { patientId, employeeEmail, serviceId, start, end } = req.body;

    const newStart = new Date(start);
    const newEnd = new Date(end);
    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
      res.status(400).json({ error: "Invalid start or end datetime" });
      return;
    }

    const patient = await Patient.findById(patientId).exec();
    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }
    if (patient.companyId.toString() !== companyId) {
      res.status(403).json({ error: "Patient not in this company" });
      return;
    }

    const company = (req as any).company as CompanyDoc;
    const isOwner = company.ownerEmail === employeeEmail;
    const isEmployee =
      Array.isArray(company.employees) &&
      company.employees.some((e) => e.email === employeeEmail);
    if (!isOwner && !isEmployee) {
      res.status(400).json({ error: "Employee not in company" });
      return;
    }

    if (patient.credit < 1) {
      res.status(400).json({ error: "Insufficient credit" });
      return;
    }

    const overlap = await Appointment.findOne({
      companyId,
      employeeEmail,
      $or: [
        { start: { $lt: newEnd, $gte: newStart } },
        { end: { $gt: newStart, $lte: newEnd } },
        { start: { $lte: newStart }, end: { $gte: newEnd } },
      ],
    }).exec();

    if (overlap) {
      res.status(409).json({ error: "That timeslot is already taken." });
      return;
    }

    patient.credit -= 1;
    await patient.save();

    const newAppt = new Appointment({
      companyId,
      patientId,
      employeeEmail,
      serviceId,
      start: newStart,
      end: newEnd,
      status: "scheduled",
    });

    await newAppt.save();

    res.status(201).json(newAppt);
  } catch (err: any) {
    console.error("Error in createAppointment:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

export const deleteAppointment: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { companyId, appointmentId } = req.params;

    const appt = await Appointment.findOne({ _id: appointmentId, companyId });
    if (!appt) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

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

export const updateAppointment: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { companyId, appointmentId } = req.params;
    const { start, end, serviceId, employeeEmail } = req.body;

    const appt = await Appointment.findOne({ _id: appointmentId, companyId });
    if (!appt) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

    const newStart = new Date(start);
    const newEnd = new Date(end);
    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
      res.status(400).json({ error: "Invalid date format" });
      return;
    }

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

// get appointment by ID// In your appointmentController.ts
export const getAppointmentById: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { companyId, appointmentId } = req.params;

    // Optionally preload company (if you need embedded services)
    // const company = (req as any).company as CompanyDoc;

    const appt = await Appointment.findOne({ _id: appointmentId, companyId })
      .populate("patientId", "name")
      .exec();

    if (!appt) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

    res.json({
      id: appt._id.toString(),
      title: appt.patientId?.name ?? "Randevu",
      start: appt.start,
      end: appt.end,
      extendedProps: {
        employeeEmail: appt.employeeEmail ?? "",
        serviceId: appt.serviceId?.toString() ?? "",
      },
    });
    console.log("Appointment found:", appt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
