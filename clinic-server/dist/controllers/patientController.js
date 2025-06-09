"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePatient = exports.markPatientCalled = exports.getNotifications = exports.flagPatientCall = exports.getPatientAppointments = exports.recordPayment = exports.updatePatient = exports.getPatients = exports.createPatient = void 0;
const Patient_1 = __importDefault(require("../models/Patient"));
const mongoose_1 = __importDefault(require("mongoose"));
const Notification_1 = __importDefault(require("../models/Notification"));
const Appointment_1 = __importDefault(require("../models/Appointment"));
// 1) createPatient
const createPatient = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { name, gender, age, phone, services, paymentHistory, note } = req.body;
        const patient = new Patient_1.default({
            companyId,
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
    }
    catch (err) {
        console.error("Error in createPatient:", err);
        res
            .status(400)
            .json({ error: "Failed to create patient", details: err.message });
    }
};
exports.createPatient = createPatient;
// 2) getPatients
const getPatients = async (req, res) => {
    try {
        const { companyId } = req.params;
        const patients = await Patient_1.default.find({ companyId }).exec();
        res.status(200).json(patients);
    }
    catch (err) {
        console.error("Error in getPatients:", err);
        res
            .status(500)
            .json({ error: "Failed to fetch patients", details: err.message });
    }
};
exports.getPatients = getPatients;
// 3) updatePatient
const updatePatient = async (req, res) => {
    try {
        const { companyId, patientId } = req.params;
        if (!mongoose_1.default.isValidObjectId(patientId)) {
            res.status(400).json({ error: "Invalid patient ID" });
            return;
        }
        const patient = await Patient_1.default.findById(patientId).exec();
        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }
        if (patient.companyId.toString() !== companyId) {
            res
                .status(403)
                .json({ error: "Patient does not belong to this company" });
            return;
        }
        const updates = req.body;
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
    }
    catch (err) {
        console.error("Error in updatePatient:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
};
exports.updatePatient = updatePatient;
// 4) recordPayment (no balanceDue)
const recordPayment = async (req, res) => {
    try {
        const { companyId, patientId } = req.params;
        if (!mongoose_1.default.isValidObjectId(patientId)) {
            res.status(400).json({ error: "Invalid patient ID" });
            return;
        }
        const patient = await Patient_1.default.findById(patientId).exec();
        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }
        if (patient.companyId.toString() !== companyId) {
            res
                .status(403)
                .json({ error: "Patient does not belong to this company" });
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
    }
    catch (err) {
        console.error("Error in recordPayment:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
};
exports.recordPayment = recordPayment;
// 5) getPatientAppointments
const getPatientAppointments = async (req, res) => {
    try {
        const { companyId, patientId } = req.params;
        if (!mongoose_1.default.isValidObjectId(patientId)) {
            res.status(400).json({ error: "Invalid patient ID" });
            return;
        }
        const patient = await Patient_1.default.findById(patientId).exec();
        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }
        if (patient.companyId.toString() !== companyId) {
            res
                .status(403)
                .json({ error: "Patient does not belong to this company" });
            return;
        }
        const appointments = await Appointment_1.default.find({
            companyId,
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
    }
    catch (err) {
        console.error("Error in getPatientAppointments:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
};
exports.getPatientAppointments = getPatientAppointments;
const flagPatientCall = async (req, res) => {
    try {
        const { companyId, patientId } = req.params;
        const { note } = req.body;
        // validate IDs, lookup patient, etc. (unchanged)…
        // Prevent duplicate pending
        const existing = await Notification_1.default.findOne({
            companyId,
            patientId,
            type: "call",
            status: "pending",
        });
        if (existing) {
            res.status(409).json({ error: "Patient is already flagged for calling" });
            return;
        }
        const workerEmail = req.user?.email;
        const notif = new Notification_1.default({
            companyId,
            patientId,
            type: "call",
            status: "pending",
            workerEmail,
            note: note?.trim() || "", // ← store the note
        });
        await notif.save();
        res.status(201).json({
            id: notif._id.toString(),
            patientId: notif.patientId,
            patientName: (await Patient_1.default.findById(patientId))?.name || "",
            createdAt: notif.createdAt.toISOString(),
            isCalled: false,
            note: notif.note, // ← return the note
        });
        return;
    }
    catch (err) {
        console.error("Error in flagPatientCall:", err);
        res.status(500).json({ error: "Server error", details: err.message });
        return;
    }
};
exports.flagPatientCall = flagPatientCall;
const getNotifications = async (req, res) => {
    try {
        const { companyId } = req.params;
        const notifications = await Notification_1.default.find({
            companyId,
            type: "call",
            status: "pending",
        })
            .populate("patientId", "name")
            .exec();
        const simple = notifications
            .filter((n) => n.patientId)
            .map((n) => ({
            id: n._id.toString(),
            patientId: n.patientId._id.toString(),
            patientName: n.patientId.name,
            createdAt: n.createdAt.toISOString(),
            isCalled: n.status === "done",
            note: n.note || "", // ← include note in payload
        }));
        res.status(200).json(simple);
    }
    catch (err) {
        console.error("Error in getNotifications:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
};
exports.getNotifications = getNotifications;
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
/**
 * 8) markPatientCalled (set status = “done”)
 */
const markPatientCalled = async (req, res) => {
    try {
        const { companyId, notificationId } = req.params;
        if (!mongoose_1.default.isValidObjectId(notificationId)) {
            res.status(400).json({ error: "Invalid notification ID" });
            return;
        }
        const notif = await Notification_1.default.findById(notificationId).exec();
        if (!notif) {
            res.status(404).json({ error: "Notification not found" });
            return;
        }
        if (notif.companyId.toString() !== companyId) {
            res
                .status(403)
                .json({ error: "Notification does not belong to this company" });
            return;
        }
        notif.status = "done";
        await notif.save();
        res.status(200).json({ message: "Notification marked done" });
    }
    catch (err) {
        console.error("Error in markPatientCalled:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
};
exports.markPatientCalled = markPatientCalled;
// 9) deletePatient
const deletePatient = async (req, res) => {
    try {
        const { companyId, patientId } = req.params;
        if (!mongoose_1.default.isValidObjectId(patientId)) {
            res.status(400).json({ error: "Invalid patient ID" });
            return;
        }
        const patient = await Patient_1.default.findById(patientId).exec();
        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }
        if (patient.companyId.toString() !== companyId) {
            res
                .status(403)
                .json({ error: "Patient does not belong to this company" });
            return;
        }
        await patient.deleteOne();
        res.status(204).send(); // No content
    }
    catch (err) {
        console.error("Error in deletePatient:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
};
exports.deletePatient = deletePatient;
