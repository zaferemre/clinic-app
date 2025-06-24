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
exports.listServices = listServices;
exports.createService = createService;
exports.updateService = updateService;
exports.deleteService = deleteService;
const serviceRepo = __importStar(require("../dataAccess/serviceRepository"));
const mongoose_1 = require("mongoose");
const http_errors_1 = __importDefault(require("http-errors"));
// List services for a company and clinic
async function listServices(companyId, clinicId) {
    if (!mongoose_1.Types.ObjectId.isValid(companyId) || !mongoose_1.Types.ObjectId.isValid(clinicId))
        throw (0, http_errors_1.default)(400, "Invalid companyId or clinicId");
    return serviceRepo.listServices(companyId, clinicId);
}
// Create new service
async function createService(companyId, clinicId, data) {
    if (!mongoose_1.Types.ObjectId.isValid(companyId) || !mongoose_1.Types.ObjectId.isValid(clinicId))
        throw (0, http_errors_1.default)(400, "Invalid companyId or clinicId");
    const doc = {
        companyId: new mongoose_1.Types.ObjectId(companyId),
        clinicId: new mongoose_1.Types.ObjectId(clinicId),
        ...data,
    };
    return serviceRepo.createService(doc);
}
// Update a service
async function updateService(companyId, clinicId, serviceId, updates) {
    if (!mongoose_1.Types.ObjectId.isValid(companyId) ||
        !mongoose_1.Types.ObjectId.isValid(clinicId) ||
        !mongoose_1.Types.ObjectId.isValid(serviceId))
        throw (0, http_errors_1.default)(400, "Invalid ObjectId(s)");
    return serviceRepo.updateServiceById(serviceId, updates);
}
// Delete a service
async function deleteService(companyId, clinicId, serviceId) {
    if (!mongoose_1.Types.ObjectId.isValid(companyId) ||
        !mongoose_1.Types.ObjectId.isValid(clinicId) ||
        !mongoose_1.Types.ObjectId.isValid(serviceId))
        throw (0, http_errors_1.default)(400, "Invalid ObjectId(s)");
    return serviceRepo.deleteServiceById(serviceId);
}
