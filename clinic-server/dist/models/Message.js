"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const MessageSchema = new mongoose_1.Schema({
    companyId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Company" },
    patientId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Patient" },
    text: { type: String, required: true },
    scheduledFor: { type: Date, required: true },
    sent: { type: Boolean, default: false },
    sentAt: { type: Date },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Message", MessageSchema);
