"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setClinicKvkk = exports.getClinicKvkk = void 0;
const Clinic_1 = __importDefault(require("../models/Clinic"));
const getClinicKvkk = async (req, res, next) => {
    try {
        const clinic = await Clinic_1.default.findById(req.params.clinicId);
        if (!clinic) {
            res.status(404).json({ error: "Not found" });
            return;
        }
        res.json({
            kvkkText: clinic.kvkkText ?? "",
            kvkkRequired: clinic.kvkkRequired ?? false,
            kvkkLastSetAt: clinic.kvkkLastSetAt,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getClinicKvkk = getClinicKvkk;
const setClinicKvkk = async (req, res, next) => {
    try {
        const { kvkkText, kvkkRequired } = req.body;
        const clinic = await Clinic_1.default.findByIdAndUpdate(req.params.clinicId, {
            kvkkText,
            kvkkRequired,
            kvkkLastSetAt: new Date(),
        }, { new: true });
        if (!clinic) {
            res.status(404).json({ error: "Not found" });
            return;
        }
        res.json({
            kvkkText: clinic.kvkkText ?? "",
            kvkkRequired: clinic.kvkkRequired ?? false,
            kvkkLastSetAt: clinic.kvkkLastSetAt,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.setClinicKvkk = setClinicKvkk;
