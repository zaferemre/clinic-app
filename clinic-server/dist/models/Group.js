"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const GroupSchema = new mongoose_1.Schema({
    companyId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Company", required: true },
    clinicId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Clinic", required: true },
    name: { type: String, required: true },
    patients: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Patient" }],
    employees: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Employee" }],
    maxSize: { type: Number, required: true },
    note: { type: String },
    credit: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ["active", "inactive", "archived"],
        default: "active",
    },
    groupType: { type: String },
    appointments: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Appointment" }],
    customFields: { type: mongoose_1.Schema.Types.Mixed },
    createdBy: { type: String, required: true }, // Firebase UID
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Group", GroupSchema);
