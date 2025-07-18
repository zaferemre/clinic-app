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
exports.getQrToken = exports.getClinicById = exports.deleteClinic = exports.updateClinic = exports.getClinic = exports.createClinic = exports.listClinics = void 0;
const clinicService = __importStar(require("../services/clinicService"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// List all clinics in a company
const listClinics = async (req, res, next) => {
    try {
        const clinics = await clinicService.listClinics(req.params.companyId);
        res.json(clinics);
    }
    catch (err) {
        next(err);
    }
};
exports.listClinics = listClinics;
// Create new clinic in company
const createClinic = async (req, res, next) => {
    try {
        // 🟢 Get current user's uid from auth middleware
        const uid = req.user?.uid;
        const clinic = await clinicService.createClinic(req.params.companyId, req.body, uid // Pass user id to service
        );
        res.status(201).json(clinic);
    }
    catch (err) {
        next(err);
    }
};
exports.createClinic = createClinic;
// Get clinic
const getClinic = async (req, res, next) => {
    try {
        const clinic = await clinicService.getClinicById(req.params.companyId, req.params.clinicId);
        res.json(clinic);
    }
    catch (err) {
        next(err);
    }
};
exports.getClinic = getClinic;
// Update clinic
const updateClinic = async (req, res, next) => {
    try {
        const updated = await clinicService.updateClinic(req.params.clinicId, req.body);
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.updateClinic = updateClinic;
// Delete clinic
const deleteClinic = async (req, res, next) => {
    try {
        await clinicService.deleteClinic(req.params.clinicId);
        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
};
exports.deleteClinic = deleteClinic;
var clinicController_1 = require("./clinicController");
Object.defineProperty(exports, "getClinicById", { enumerable: true, get: function () { return clinicController_1.getClinic; } });
const JWT_SECRET = process.env.QR_TOKEN_SECRET ?? "supersecret";
// QR token üret
const getQrToken = async (req, res, next) => {
    try {
        const { companyId, clinicId } = req.params;
        // İstediğin claimleri koyabilirsin
        const token = jsonwebtoken_1.default.sign({ companyId, clinicId, ts: Date.now() }, JWT_SECRET, { expiresIn: "2h" });
        res.json({ token });
    }
    catch (err) {
        next(err);
    }
};
exports.getQrToken = getQrToken;
