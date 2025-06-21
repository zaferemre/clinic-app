"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClinic = exports.updateClinic = exports.getClinicById = exports.createClinic = exports.listClinics = void 0;
const clinicService = __importStar(require("../services/clinicService"));
const Clinic_1 = __importDefault(require("../models/Clinic"));
const Company_1 = __importDefault(require("../models/Company"));
const mongoose_1 = __importDefault(require("mongoose"));
// List all clinics for a company
const listClinics = async (req, res, next) => {
    try {
        const { companyId } = req.params;
        const clinics = await clinicService.listClinics(companyId);
        res.status(200).json(clinics);
    }
    catch (err) {
        next(err);
    }
};
exports.listClinics = listClinics;
// Create new clinic for a company
const createClinic = async (req, res, next) => {
    try {
        const { companyId } = req.params;
        const { name, address, phoneNumber, workingHours } = req.body;
        const exists = await Clinic_1.default.findOne({
            companyId: new mongoose_1.default.Types.ObjectId(companyId),
            name,
        });
        if (exists) {
            return res
                .status(400)
                .json({ message: "A clinic with this name already exists." });
        }
        const clinic = await clinicService.createClinic(companyId, {
            name,
            address,
            phoneNumber,
            workingHours,
            services: [],
        });
        await Company_1.default.findByIdAndUpdate(companyId, {
            $addToSet: { clinics: clinic._id },
        });
        res.status(201).json(clinic);
    }
    catch (err) {
        next(err);
    }
};
exports.createClinic = createClinic;
const getClinicById = async (req, res, next) => {
    try {
        const { companyId, clinicId } = req.params;
        const clinic = await clinicService.getClinic(companyId, clinicId);
        res.status(200).json(clinic);
    }
    catch (err) {
        next(err);
    }
};
exports.getClinicById = getClinicById;
const updateClinic = async (req, res, next) => {
    try {
        const { companyId, clinicId } = req.params;
        const updated = await clinicService.updateClinic(companyId, clinicId, req.body);
        res.status(200).json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.updateClinic = updateClinic;
const deleteClinic = async (req, res, next) => {
    try {
        const { companyId, clinicId } = req.params;
        await clinicService.deleteClinic(companyId, clinicId);
        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
};
exports.deleteClinic = deleteClinic;
