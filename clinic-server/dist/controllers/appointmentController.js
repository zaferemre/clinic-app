"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeAppointment = exports.createAppointment = exports.getAppointments = void 0;
const Appointment_1 = __importDefault(require("../models/Appointment"));
const Patient_1 = __importDefault(require("../models/Patient"));
const mongoose_1 = __importDefault(require("mongoose"));
const getAppointments = async (req, res) => {
    try {
        const { clinicId } = req.params;
        const appointments = await Appointment_1.default.find({ clinicId })
            .populate("patientId", "name")
            .exec();
        const events = appointments.map((appt) => ({
            id: appt._id,
            title: appt.patientId.name,
            start: appt.start,
            end: appt.end,
            color: appt.status === "done"
                ? "#6b7280"
                : appt.status === "cancelled"
                    ? "#ef4444"
                    : "#3b82f6",
            workerEmail: appt.workerEmail,
        }));
        res.status(200).json(events);
    }
    catch (err) {
        console.error("Error in getAppointments:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
};
exports.getAppointments = getAppointments;
const createAppointment = async (req, res) => {
    try {
        const { clinicId } = req.params;
        const { patientId, workerEmail, start, end } = req.body;
        // 1) Verify patient
        const patient = await Patient_1.default.findById(patientId).exec();
        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }
        if (patient.clinicId.toString() !== clinicId) {
            res.status(403).json({ error: "Patient does not belong to this clinic" });
            return;
        }
        // 2) Verify workerEmail belongs to clinic
        const clinic = req.clinic; // set by authorizeClinicAccess
        if (clinic.workerEmail !== workerEmail &&
            !clinic.workers.find((w) => w.email === workerEmail)) {
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
        const overlap = await Appointment_1.default.findOne({
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
        const newAppt = new Appointment_1.default({
            clinicId,
            patientId,
            workerEmail,
            start: newStart,
            end: newEnd,
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
const completeAppointment = async (req, res) => {
    try {
        const { clinicId, appointmentId } = req.params;
        if (!mongoose_1.default.isValidObjectId(appointmentId)) {
            res.status(400).json({ error: "Invalid appointment ID" });
            return;
        }
        const appt = await Appointment_1.default.findById(appointmentId).exec();
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
    }
    catch (err) {
        console.error("Error in completeAppointment:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
};
exports.completeAppointment = completeAppointment;
