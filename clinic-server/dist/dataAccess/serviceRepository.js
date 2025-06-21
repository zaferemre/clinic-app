"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findById = void 0;
exports.listServices = listServices;
exports.findServiceById = findServiceById;
exports.createService = createService;
exports.updateServiceById = updateServiceById;
exports.deleteServiceById = deleteServiceById;
// dataAccess/serviceRepository.ts
const Service_1 = __importDefault(require("../models/Service"));
const mongoose_1 = require("mongoose");
async function listServices(companyId, clinicId) {
    return Service_1.default.find({
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
    });
}
async function findServiceById(companyId, clinicId, serviceId) {
    return Service_1.default.findOne({
        _id: new mongoose_1.Types.ObjectId(serviceId),
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
    });
}
async function createService(doc) {
    return Service_1.default.create(doc);
}
async function updateServiceById(serviceId, updates) {
    return Service_1.default.findByIdAndUpdate(serviceId, updates, { new: true });
}
async function deleteServiceById(serviceId) {
    await Service_1.default.findByIdAndDelete(serviceId);
}
exports.findById = findServiceById;
