"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PatientSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "company",
        required: true,
    },
    clinicId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Clinic", required: true },
    name: { type: String, required: true },
    age: { type: Number },
    phone: { type: String },
    email: { type: String },
    credit: { type: Number, default: 0 },
    services: [
        {
            serviceId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Service",
                required: true,
            },
            pointsLeft: { type: Number },
            sessionsTaken: { type: Number },
        },
    ],
    groups: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Group" }],
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
    status: {
        type: String,
        enum: ["active", "inactive", "archived"],
        default: "active",
    },
    lastAppointmentAt: { type: Date },
    note: { type: String },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Patient", PatientSchema);
