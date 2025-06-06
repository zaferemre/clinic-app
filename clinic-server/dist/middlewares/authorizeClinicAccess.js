"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeClinicAccess = void 0;
const Clinic_1 = __importDefault(require("../models/Clinic"));
const authorizeClinicAccess = async (req, res, next) => {
    const { clinicId } = req.params;
    const userEmail = req.user?.email;
    if (!userEmail) {
        res.status(401).json({ error: "User not authenticated" });
        return;
    }
    try {
        const clinic = await Clinic_1.default.findById(clinicId).exec();
        if (!clinic) {
            res.status(404).json({ error: "Clinic not found" });
            return;
        }
        // Owner can always access; otherwise check in workers array
        if (clinic.ownerEmail === userEmail ||
            clinic.workers.find((w) => w.email === userEmail)) {
            req.clinic = clinic;
            next();
        }
        else {
            res.status(403).json({ error: "Unauthorized access" });
        }
    }
    catch (err) {
        console.error("Error in authorizeClinicAccess:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.authorizeClinicAccess = authorizeClinicAccess;
