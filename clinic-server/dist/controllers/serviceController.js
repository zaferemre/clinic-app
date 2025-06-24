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
exports.deleteService = exports.updateService = exports.createService = exports.listServices = void 0;
const serviceService = __importStar(require("../services/serviceService"));
// List services
const listServices = async (req, res, next) => {
    try {
        const services = await serviceService.listServices(req.params.companyId, req.params.clinicId);
        res.json(services);
    }
    catch (err) {
        next(err);
    }
};
exports.listServices = listServices;
// Create service
const createService = async (req, res, next) => {
    try {
        const service = await serviceService.createService(req.params.companyId, req.params.clinicId, req.body);
        res.status(201).json(service);
    }
    catch (err) {
        next(err);
    }
};
exports.createService = createService;
// Update service
const updateService = async (req, res, next) => {
    try {
        const updated = await serviceService.updateService(req.params.companyId, req.params.clinicId, req.params.serviceId, req.body);
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.updateService = updateService;
// Delete service
const deleteService = async (req, res, next) => {
    try {
        await serviceService.deleteService(req.params.companyId, req.params.clinicId, req.params.serviceId);
        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
};
exports.deleteService = deleteService;
