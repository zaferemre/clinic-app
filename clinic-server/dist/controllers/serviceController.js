"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteService = exports.updateService = exports.createService = exports.listServices = void 0;
const Service_1 = __importDefault(require("../models/Service"));
const Clinic_1 = __importDefault(require("../models/Clinic"));
/**
 * GET  /company/:companyId/clinics/:clinicId/services
 */
const listServices = async (req, res, next) => {
    try {
        const { companyId, clinicId } = req.params;
        const services = await Service_1.default.find({ companyId, clinicId }).exec();
        res.json(services);
    }
    catch (err) {
        next(err);
    }
};
exports.listServices = listServices;
/**
 * POST /company/:companyId/clinics/:clinicId/services
 */
const createService = async (req, res, next) => {
    try {
        const { companyId, clinicId } = req.params;
        const { serviceName, servicePrice, serviceDuration } = req.body;
        const svc = new Service_1.default({
            companyId,
            clinicId,
            serviceName,
            servicePrice,
            serviceDuration,
        });
        await svc.save();
        // push into clinic.services
        await Clinic_1.default.findByIdAndUpdate(clinicId, {
            $addToSet: { services: svc._id },
        }).exec();
        res.status(201).json(svc);
    }
    catch (err) {
        next(err);
    }
};
exports.createService = createService;
/**
 * PATCH  /company/:companyId/clinics/:clinicId/services/:serviceId
 */
const updateService = async (req, res, next) => {
    try {
        const { serviceId } = req.params;
        const updates = req.body;
        const svc = await Service_1.default.findByIdAndUpdate(serviceId, updates, {
            new: true,
        }).exec();
        // **send back the updated document**
        res.json(svc);
    }
    catch (err) {
        next(err);
    }
};
exports.updateService = updateService;
/**
 * DELETE /company/:companyId/clinics/:clinicId/services/:serviceId
 */
const deleteService = async (req, res, next) => {
    try {
        const { clinicId, serviceId } = req.params;
        await Service_1.default.findByIdAndDelete(serviceId).exec();
        await Clinic_1.default.findByIdAndUpdate(clinicId, {
            $pull: { services: serviceId },
        }).exec();
        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
};
exports.deleteService = deleteService;
