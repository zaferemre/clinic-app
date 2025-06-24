"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const RoleSchema = new mongoose_1.Schema({
    companyId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Company", required: true },
    clinicId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Clinic", required: true },
    name: { type: String, required: true },
    createdBy: { type: String }, // Firebase UID
    isDefault: { type: Boolean, default: false },
}, { timestamps: true });
RoleSchema.index({ companyId: 1, clinicId: 1, name: 1 }, { unique: true });
exports.default = (0, mongoose_1.model)("Role", RoleSchema);
