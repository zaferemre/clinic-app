"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Re-use your existing sub-schemas (workingHourSchema, employeeSchema)
const WorkingHour_1 = require("./WorkingHour");
const Employee_1 = require("./Employee");
const companyServiceSchema = new mongoose_1.Schema({
    serviceName: { type: String, required: true },
    servicePrice: { type: Number, required: true, min: 0 },
    serviceKapora: { type: Number, default: 0, min: 0 },
    serviceDuration: { type: Number, required: true, min: 1 },
}, { _id: true });
const CompanySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    ownerName: { type: String, required: true },
    ownerEmail: { type: String, required: true, index: true },
    ownerImageUrl: { type: String, default: "" },
    companyType: { type: String, required: true },
    address: { type: String },
    phoneNumber: { type: String },
    googleUrl: { type: String },
    websiteUrl: { type: String },
    companyImgUrl: { type: String, default: "" },
    services: { type: [companyServiceSchema], default: [] },
    location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: (arr) => arr.length === 2,
                message: "Location must be [lng, lat]",
            },
        },
    },
    workingHours: { type: [WorkingHour_1.workingHourSchema], default: [] },
    employees: { type: [Employee_1.employeeSchema], default: [] },
    // <-- dynamic roles array
    roles: {
        type: [String],
        default: ["owner", "admin", "manager", "staff"],
    },
    isPaid: { type: Boolean, default: false },
    subscription: {
        status: {
            type: String,
            enum: ["active", "trialing", "canceled"],
            default: "canceled",
        },
        provider: {
            type: String,
            enum: ["iyzico", "manual", "other"],
            default: "manual",
        },
        nextBillingDate: { type: Date },
    },
}, { timestamps: true });
CompanySchema.index({ location: "2dsphere" });
exports.default = mongoose_1.default.models.Company ||
    mongoose_1.default.model("Company", CompanySchema);
