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
exports.selfRegisterPatient = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const patientService = __importStar(require("../services/patientService"));
const Clinic_1 = __importDefault(require("../models/Clinic"));
const http_errors_1 = __importDefault(require("http-errors"));
if (!process.env.QR_TOKEN_SECRET && process.env.NODE_ENV === "production") {
    throw new Error("QR_TOKEN_SECRET must be set in production!");
}
const JWT_SECRET = process.env.QR_TOKEN_SECRET ?? "supersecret";
const selfRegisterPatient = async (req, res, next) => {
    const { companyId, clinicId, token } = req.params;
    const { name, phone, email, kvkkAccepted, clinicKvkkAccepted } = req.body;
    try {
        // Token doğrulama
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (payload.companyId !== companyId || payload.clinicId !== clinicId) {
            throw (0, http_errors_1.default)(403, "Token/URL mismatch");
        }
        // Klinik KVKK’yı çek
        const clinic = await Clinic_1.default.findById(clinicId);
        if (!kvkkAccepted)
            throw (0, http_errors_1.default)(400, "KVKK zorunlu");
        if (clinic?.kvkkRequired && !clinicKvkkAccepted) {
            throw (0, http_errors_1.default)(400, "Klinik sözleşmesi zorunlu");
        }
        const created = await patientService.createPatient(companyId, clinicId, {
            name,
            phone,
            email,
            kvkkAccepted: true,
            kvkkAcceptedAt: new Date(),
            clinicKvkkAccepted: clinicKvkkAccepted ?? false,
            clinicKvkkAcceptedAt: clinicKvkkAccepted ? new Date() : undefined,
            clinicKvkkVersionAtAccept: clinic?.kvkkLastSetAt,
        });
        res.status(201).json({ ok: true, patientId: created._id });
    }
    catch (err) {
        next(err);
    }
};
exports.selfRegisterPatient = selfRegisterPatient;
