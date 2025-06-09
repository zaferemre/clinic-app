"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteService = exports.updateService = exports.createService = exports.getServices = void 0;
const Company_1 = __importDefault(require("../models/Company"));
// GET  /company/:companyId/services
const getServices = async (req, res) => {
    try {
        const company = await Company_1.default.findById(req.params.companyId).exec();
        if (!company) {
            res.status(404).json({ error: "Company not found" });
            return;
        }
        res.json(company.services);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getServices = getServices;
// POST /company/:companyId/services
const createService = async (req, res) => {
    try {
        const { serviceName, servicePrice, serviceKapora, serviceDuration } = req.body;
        if (!serviceName || servicePrice == null || serviceDuration == null) {
            res.status(400).json({ error: "Eksik alanlar var." });
            return;
        }
        const company = await Company_1.default.findById(req.params.companyId).exec();
        if (!company) {
            res.status(404).json({ error: "Company not found" });
            return;
        }
        const newSvc = {
            serviceName,
            servicePrice,
            serviceKapora,
            serviceDuration,
        };
        company.services.push(newSvc);
        await company.save();
        res.status(201).json(company.services[company.services.length - 1]);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.createService = createService;
// PUT  /company/:companyId/services/:serviceId
const updateService = async (req, res) => {
    try {
        const { serviceId, companyId } = req.params;
        const updates = req.body;
        const company = await Company_1.default.findById(companyId).exec();
        if (!company) {
            res.status(404).json({ error: "Company not found" });
            return;
        }
        const svc = company.services.id(serviceId);
        if (!svc) {
            res.status(404).json({ error: "Service not found" });
            return;
        }
        Object.entries(updates).forEach(([k, v]) => {
            // @ts-ignore
            svc[k] = v;
        });
        await company.save();
        res.json(svc);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateService = updateService;
// DELETE /company/:companyId/services/:serviceId
const deleteService = async (req, res) => {
    try {
        const { companyId, serviceId } = req.params;
        const company = await Company_1.default.findById(companyId).exec();
        if (!company) {
            res.status(404).json({ error: "Company not found" });
            return;
        }
        const svc = company.services.id(serviceId);
        if (!svc) {
            res.status(404).json({ error: "Service not found" });
            return;
        }
        svc.remove();
        await company.save();
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteService = deleteService;
