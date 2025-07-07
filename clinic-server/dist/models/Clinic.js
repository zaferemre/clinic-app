"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const WorkingHour_1 = require("./WorkingHour");
const ClinicSchema = new mongoose_1.Schema({
    companyId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Company", required: true },
    name: { type: String, required: true },
    address: {
        province: { type: String, default: "" },
        district: { type: String, default: "" },
        town: { type: String, default: "" },
        neighborhood: { type: String, default: "" },
        street: { type: String, default: "" },
        building: { type: String, default: "" },
        zip: { type: String, default: "" },
    },
    phoneNumber: { type: String },
    location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: undefined },
    },
    workingHours: { type: [WorkingHour_1.workingHourSchema], default: [] },
    services: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Service" }],
    isActive: { type: Boolean, default: true },
    // --- KVKK/Sözleşme alanları ---
    kvkkText: { type: String, default: "" },
    kvkkRequired: { type: Boolean, default: false },
    kvkkLastSetAt: { type: Date },
    // ---
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Clinic", ClinicSchema);
