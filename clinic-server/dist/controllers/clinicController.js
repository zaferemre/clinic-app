"use strict";
// src/controllers/clinicController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkersList = exports.joinClinic = exports.updateWorker = exports.removeWorker = exports.addWorker = exports.getClinicById = exports.createClinic = exports.getClinicByEmail = void 0;
const Clinic_1 = __importDefault(require("../models/Clinic"));
const firebase_1 = require("../config/firebase");
// ────────────────────────────────────────────────────────────────────────────
// 1) getClinicByEmail
// ────────────────────────────────────────────────────────────────────────────
const getClinicByEmail = async (req, res, next) => {
    try {
        const ownerEmail = req.user?.email;
        if (!ownerEmail) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }
        const clinic = await Clinic_1.default.findOne({
            $or: [{ ownerEmail: ownerEmail }, { "workers.email": ownerEmail }],
        }).exec();
        if (!clinic) {
            res.status(404).json({ error: "No clinic for this user" });
            return;
        }
        res.status(200).json(clinic);
        return;
    }
    catch (err) {
        console.error("Error in GET /clinic/by-email:", err);
        res.status(500).json({ error: "Server error", details: err.message });
        return;
    }
};
exports.getClinicByEmail = getClinicByEmail;
// ────────────────────────────────────────────────────────────────────────────
// 2) createClinic
// ────────────────────────────────────────────────────────────────────────────
const createClinic = async (req, res, next) => {
    try {
        const ownerEmail = req.user?.email;
        if (!ownerEmail) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }
        const { name } = req.body;
        if (!name?.trim()) {
            res.status(400).json({ error: "Clinic name is required" });
            return;
        }
        const existing = await Clinic_1.default.findOne({ ownerEmail }).exec();
        if (existing) {
            res
                .status(409)
                .json({ error: "You already have a clinic", clinic: existing });
            return;
        }
        const newClinic = new Clinic_1.default({
            name: name.trim(),
            ownerEmail,
            workers: [],
        });
        const saved = await newClinic.save();
        res.status(201).json(saved);
        return;
    }
    catch (err) {
        console.error("⚠️ Error in POST /clinic/new:", err);
        res
            .status(500)
            .json({ error: "Failed to create clinic", details: err.message });
        return;
    }
};
exports.createClinic = createClinic;
// ────────────────────────────────────────────────────────────────────────────
// 3) getClinicById
// ────────────────────────────────────────────────────────────────────────────
const getClinicById = async (req, res, next) => {
    try {
        const { clinicId } = req.params;
        const clinic = await Clinic_1.default.findById(clinicId).exec();
        if (!clinic) {
            res.status(404).json({ error: "Clinic not found" });
            return;
        }
        res.status(200).json(clinic);
        return;
    }
    catch (err) {
        console.error("Error in GET /clinic/:clinicId:", err);
        res.status(500).json({ error: "Server error", details: err.message });
        return;
    }
};
exports.getClinicById = getClinicById;
// ────────────────────────────────────────────────────────────────────────────
// 4) addWorker (owner-only)
// ────────────────────────────────────────────────────────────────────────────
const addWorker = async (req, res) => {
    try {
        const { clinicId } = req.params;
        const { email } = req.body;
        if (!email?.trim()) {
            res.status(400).json({ error: "Worker email is required" });
            return;
        }
        const userEmail = req.user?.email;
        if (!userEmail) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }
        const clinic = await Clinic_1.default.findById(clinicId).exec();
        if (!clinic) {
            res.status(404).json({ error: "Clinic not found" });
            return;
        }
        if (clinic.ownerEmail !== userEmail) {
            res.status(403).json({ error: "Only the owner can add workers" });
            return;
        }
        // TypeScript knows clinic.workers is WorkerSubdoc[]
        if (clinic.workers.some((w) => w.email === email) ||
            clinic.ownerEmail === email) {
            res.status(409).json({ error: "User is already a worker or owner" });
            return;
        }
        try {
            const fbUser = await firebase_1.admin.auth().getUserByEmail(email);
            const displayName = fbUser.displayName ?? "";
            const photoURL = fbUser.photoURL ?? "";
            clinic.workers.push({
                email,
                name: displayName,
                pictureUrl: photoURL,
                role: "staff",
            });
            await clinic.save();
            res.status(201).json({ email, name: displayName, role: "staff" });
            return;
        }
        catch (err) {
            console.error("Error verifying Firebase user:", err);
            res
                .status(404)
                .json({ error: "No registered Firebase user with that email" });
            return;
        }
    }
    catch (err) {
        console.error("Error in addWorker:", err);
        res.status(500).json({ error: "Server error", details: err.message });
        return;
    }
};
exports.addWorker = addWorker;
// ────────────────────────────────────────────────────────────────────────────
// 5) removeWorker (owner-only)
// ────────────────────────────────────────────────────────────────────────────
const removeWorker = async (req, res) => {
    try {
        const { clinicId, workerEmail } = req.params;
        const userEmail = req.user?.email;
        if (!userEmail) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }
        const clinic = await Clinic_1.default.findById(clinicId).exec();
        if (!clinic) {
            res.status(404).json({ error: "Clinic not found" });
            return;
        }
        if (clinic.ownerEmail !== userEmail) {
            res.status(403).json({ error: "Only the owner can remove workers" });
            return;
        }
        // Filter out the worker whose email matches workerEmail
        clinic.workers = clinic.workers.filter((w) => w.email !== workerEmail);
        await clinic.save();
        res.status(200).json({ message: "Worker removed" });
        return;
    }
    catch (err) {
        console.error("Error in removeWorker:", err);
        res.status(500).json({ error: "Server error", details: err.message });
        return;
    }
};
exports.removeWorker = removeWorker;
// ────────────────────────────────────────────────────────────────────────────
// 6) updateWorker (owner-only)
// ────────────────────────────────────────────────────────────────────────────
const updateWorker = async (req, res) => {
    try {
        const { clinicId, workerEmail } = req.params;
        const { name, role } = req.body;
        const userEmail = req.user?.email;
        if (!userEmail) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }
        const clinic = await Clinic_1.default.findById(clinicId).exec();
        if (!clinic) {
            res.status(404).json({ error: "Clinic not found" });
            return;
        }
        if (clinic.ownerEmail !== userEmail) {
            res.status(403).json({ error: "Only the owner can update workers" });
            return;
        }
        const idx = clinic.workers.findIndex((w) => w.email === workerEmail);
        if (idx === -1) {
            res.status(404).json({ error: "Worker not found" });
            return;
        }
        if (name !== undefined) {
            clinic.workers[idx].name = name;
        }
        if (role !== undefined) {
            clinic.workers[idx].role = role;
        }
        await clinic.save();
        res.status(200).json(clinic.workers[idx]);
        return;
    }
    catch (err) {
        console.error("Error in updateWorker:", err);
        res.status(500).json({ error: "Server error", details: err.message });
        return;
    }
};
exports.updateWorker = updateWorker;
// ────────────────────────────────────────────────────────────────────────────
// 7) joinClinic (any authenticated user can join by clinicId)
// ────────────────────────────────────────────────────────────────────────────
const joinClinic = async (req, res) => {
    try {
        const { clinicId } = req.params;
        const { joinCode } = req.body;
        const userEmail = req.user?.email;
        if (!userEmail) {
            console.log("No userEmail found in req.user!", req.user);
            res.status(401).json({ error: "No userEmail" });
            return;
        }
        if (!joinCode || joinCode !== clinicId) {
            res.status(400).json({ error: "joinCode is invalid or missing" });
            return;
        }
        const clinic = await Clinic_1.default.findById(clinicId).exec();
        if (!clinic) {
            console.log("No clinic found");
            res.status(404).json({ error: "No clinic" });
            return;
        }
        // Prevent owner from re‐joining
        if (clinic.ownerEmail === userEmail) {
            res.status(409).json({ error: "Owner cannot join as worker" });
            return;
        }
        // Prevent duplicate entries
        const alreadyWorker = clinic.workers.some((w) => w.email === userEmail);
        if (alreadyWorker) {
            res.status(409).json({ error: "Already a worker" });
            return;
        }
        // Pull displayName + photoURL from Firebase token payload
        const displayName = req.user?.name ?? "Unknown";
        const photoURL = req.user?.picture ?? "";
        // Add new worker
        clinic.workers.push({
            email: userEmail,
            name: displayName,
            pictureUrl: photoURL,
            role: "staff",
        });
        await clinic.save();
        console.log("Joined clinic, new workers list:", clinic.workers);
        res.status(200).json({ message: "Joined clinic", workers: clinic.workers });
        return;
    }
    catch (err) {
        console.error("FATAL joinClinic error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
        return;
    }
};
exports.joinClinic = joinClinic;
// ────────────────────────────────────────────────────────────────────────────
// 8) getWorkersList (owner or worker can see the list of workers)
// ────────────────────────────────────────────────────────────────────────────
const getWorkersList = async (req, res) => {
    try {
        const { clinicId } = req.params;
        const clinic = await Clinic_1.default.findById(clinicId).exec();
        if (!clinic) {
            res.status(404).json({ error: "Clinic not found" });
            return;
        }
        // Return only the workers array
        res.status(200).json(clinic.workers);
        return;
    }
    catch (err) {
        console.error("Error in GET /clinic/:clinicId/workers:", err);
        res.status(500).json({ error: "Server error", details: err.message });
        return;
    }
};
exports.getWorkersList = getWorkersList;
