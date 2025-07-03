"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CompanySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    ownerUid: { type: String, required: true, index: true },
    subscription: {
        plan: {
            type: String,
            enum: ["free", "basic", "pro", "enterprise"],
            default: "free",
        },
        status: {
            type: String,
            enum: ["active", "trialing", "canceled"],
            default: "trialing",
        },
        provider: {
            type: String,
            enum: ["iyzico", "manual", "other"],
            default: "manual",
        },
        maxClinics: { type: Number, default: 1 },
        nextBillingDate: { type: Date },
        allowedFeatures: [{ type: String }],
    },
    joinCode: { type: String, required: true, unique: true },
    clinics: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Clinic" }],
    settings: {
        allowPublicBooking: { type: Boolean, default: false },
        inactivityThresholdDays: { type: Number, default: 90 },
    },
    websiteUrl: { type: String },
    socialLinks: { type: Map, of: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Company", CompanySchema);
