"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppointmentById = exports.updateAppointment = exports.deleteAppointment = exports.createAppointment = exports.getAppointments = void 0;
const Appointment_1 = __importDefault(require("../models/Appointment"));
const Patient_1 = __importDefault(require("../models/Patient"));
// src/controllers/appointmentController.ts
const getAppointments = async (req, res) => {
    try {
        const { companyId } = req.params;
        const appointments = await Appointment_1.default.find({ companyId })
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
            color: appt.status === "done"
                ? "#6b7280"
                : appt.status === "cancelled"
                    ? "#ef4444"
                    : "#3b82f6",
        }));
        res.status(200).json(events);
    }
    catch (err) {
        console.error("Error fetching appointments:", err);
        res.status(500).json({ error: "Failed to fetch appointments." });
    }
};
exports.getAppointments = getAppointments;
const createAppointment = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { patientId, employeeEmail, serviceId, start, end } = req.body;
        const newStart = new Date(start);
        const newEnd = new Date(end);
        if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
            res.status(400).json({ error: "Invalid start or end datetime" });
            return;
        }
        const patient = await Patient_1.default.findById(patientId).exec();
        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }
        if (patient.companyId.toString() !== companyId) {
            res.status(403).json({ error: "Patient not in this company" });
            return;
        }
        const company = req.company;
        const isOwner = company.ownerEmail === employeeEmail;
        const isEmployee = Array.isArray(company.employees) &&
            company.employees.some((e) => e.email === employeeEmail);
        if (!isOwner && !isEmployee) {
            res.status(400).json({ error: "Employee not in company" });
            return;
        }
        if (patient.credit < 1) {
            res.status(400).json({ error: "Insufficient credit" });
            return;
        }
        const overlap = await Appointment_1.default.findOne({
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
        const newAppt = new Appointment_1.default({
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
    }
    catch (err) {
        console.error("Error in createAppointment:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
};
exports.createAppointment = createAppointment;
const deleteAppointment = async (req, res) => {
    try {
        const { companyId, appointmentId } = req.params;
        const appt = await Appointment_1.default.findOne({ _id: appointmentId, companyId });
        if (!appt) {
            res.status(404).json({ error: "Appointment not found" });
            return;
        }
        // Refund 1 credit back to patient
        const patient = await Patient_1.default.findById(appt.patientId);
        if (patient) {
            patient.credit += 1;
            await patient.save();
        }
        await appt.deleteOne();
        res.status(204).send();
    }
    catch (err) {
        console.error("Error in deleteAppointment:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
};
exports.deleteAppointment = deleteAppointment;
const updateAppointment = async (req, res) => {
    try {
        const { companyId, appointmentId } = req.params;
        const { start, end, serviceId, employeeEmail } = req.body;
        const appt = await Appointment_1.default.findOne({ _id: appointmentId, companyId });
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
        if (serviceId)
            appt.serviceId = serviceId;
        if (employeeEmail)
            appt.employeeEmail = employeeEmail;
        await appt.save();
        res.status(200).json(appt);
    }
    catch (err) {
        console.error("Error in updateAppointment:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
};
exports.updateAppointment = updateAppointment;
// get appointment by ID// In your appointmentController.ts
const getAppointmentById = async (req, res) => {
    try {
        const { companyId, appointmentId } = req.params;
        // Optionally preload company (if you need embedded services)
        const company = req.company;
        const appt = await Appointment_1.default.findOne({ _id: appointmentId, companyId })
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.getAppointmentById = getAppointmentById;
