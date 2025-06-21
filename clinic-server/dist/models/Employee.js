"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const WorkingHour_1 = require("./WorkingHour");
const EmployeeSchema = new mongoose_1.Schema({
    companyId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Company", required: true },
    clinicId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Clinic", required: true },
    userId: { type: String, required: true, index: true },
    email: { type: String, required: true },
    name: { type: String },
    phone: { type: String },
    role: {
        type: String,
        enum: [
            "owner",
            "staff",
            "admin",
            "doctor",
            "nurse",
            "receptionist",
            "other",
        ],
        default: "other",
    },
    pictureUrl: { type: String },
    services: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Service" }],
    workingHours: { type: [WorkingHour_1.workingHourSchema], default: [] },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Employee", EmployeeSchema);
