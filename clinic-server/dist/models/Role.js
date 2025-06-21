"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const RoleSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "company",
        required: true,
    },
    name: { type: String, required: true },
    permissions: [{ type: String, required: true }],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "Employee" },
    isDefault: { type: Boolean, default: false },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Role", RoleSchema);
