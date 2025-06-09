"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const patientSchema = new mongoose_1.default.Schema({
    companyId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "Company",
    },
    name: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    age: { type: Number },
    phone: { type: String },
    credit: { type: Number, default: 0 },
    services: [
        {
            name: { type: String },
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
            },
            amount: { type: Number },
            note: { type: String },
        },
    ],
    note: { type: String },
}, { timestamps: true });
const Patient = mongoose_1.default.models.Patient ||
    mongoose_1.default.model("Patient", patientSchema);
exports.default = Patient;
