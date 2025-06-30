"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const MembershipSchema = new mongoose_1.Schema({
    companyId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    companyName: { type: String, required: true },
    clinicId: { type: mongoose_1.Schema.Types.ObjectId, required: false },
    clinicName: { type: String, required: false },
    roles: { type: [String], default: [] },
}, { _id: false });
const UserSchema = new mongoose_1.Schema({
    uid: { type: String, required: true, unique: true },
    email: { type: String },
    name: { type: String },
    photoUrl: { type: String },
    phoneNumber: { type: String },
    theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
    },
    memberships: { type: [MembershipSchema], default: [] },
    notificationPrefs: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("User", UserSchema);
