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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findByCompany = findByCompany;
exports.findOne = findOne;
exports.findByPatient = findByPatient;
exports.create = create;
exports.updateById = updateById;
exports.deleteById = deleteById;
exports.findOverlap = findOverlap;
exports.ensureUserIsEmployee = ensureUserIsEmployee;
const Appointment_1 = __importDefault(require("../models/Appointment"));
function findByCompany(companyId) {
    return Appointment_1.default.find({ companyId })
        .populate("patientId", "name")
        .populate("serviceId", "serviceName")
        .exec();
}
function findOne(companyId, appointmentId) {
    return Appointment_1.default.findOne({ _id: appointmentId, companyId })
        .populate("patientId", "name")
        .exec();
}
function findByPatient(companyId, patientId) {
    // returns all appointments for a given patient, sorted newest first
    return Appointment_1.default.find({ companyId, patientId }).sort({ start: -1 }).exec();
}
function create(data) {
    return new Appointment_1.default(data).save();
}
function updateById(companyId, appointmentId, updates) {
    return Appointment_1.default.findOneAndUpdate({ _id: appointmentId, companyId }, updates, { new: true }).exec();
}
function deleteById(companyId, appointmentId) {
    return Appointment_1.default.deleteOne({ _id: appointmentId, companyId }).exec();
}
function findOverlap(companyId, employeeEmail, start, end) {
    return Appointment_1.default.findOne({
        companyId,
        employeeEmail,
        $or: [
            { start: { $lt: end, $gte: start } },
            { end: { $gt: start, $lte: end } },
            { start: { $lte: start }, end: { $gte: end } },
        ],
    }).exec();
}
// simple stub for “owner or employee” check
async function ensureUserIsEmployee(companyId, email) {
    const { findByIdWithAccessCheck } = await Promise.resolve().then(() => __importStar(require("./companyRepository")));
    const company = await findByIdWithAccessCheck(companyId, email);
    if (!company)
        throw { status: 403, message: "Employee not in company" };
}
