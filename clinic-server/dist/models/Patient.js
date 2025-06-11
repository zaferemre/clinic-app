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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const patientSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "Company",
    },
    name: { type: String, required: true },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true,
    },
    age: { type: Number },
    phone: { type: String },
    credit: { type: Number, default: 0 },
    services: [
        {
            name: { type: String, required: true },
            pointsLeft: { type: Number },
            sessionsTaken: { type: Number },
        },
    ],
    paymentHistory: [
        {
            date: { type: Date, default: Date.now },
            method: {
                type: String,
                enum: ["Havale", "Card", "Cash", "Unpaid"],
                required: true,
            },
            amount: { type: Number, required: true },
            note: { type: String },
        },
    ],
    note: { type: String },
}, { timestamps: true });
const Patient = mongoose_1.default.models.Patient ||
    mongoose_1.default.model("Patient", patientSchema);
exports.default = Patient;
