import { RequestHandler } from "express";
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

    const events = appointments.map((appt) => {
      const patientName = appt.patientId?.name ?? "Bilinmeyen Hasta";
      let color = "#3b82f6";
      if (appt.status === "done") {
        color = "#6b7280";
      } else if (appt.status === "cancelled") {
        color = "#ef4444";
      }
      return {
        id: appt._id.toString(),
        title: patientName,
        start: appt.start,
        end: appt.end,
        extendedProps: {
          employeeEmail: appt.employeeEmail,
          serviceId: appt.serviceId?.toString?.() ?? null,
        },
        color,
      };
    });
    res.status(200).json(events);
  } catch (err: any) {
    console.error("Error in getAppointments:", err);
    res.status(500).json({ error: "Server error", details: err.message });
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

    const company = (req as any).company as ICompany;
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
