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
        if (!company)
            return res.status(404).json({ error: "Company not found" });
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
        const company = await Company_1.default.findById(req.params.companyId).exec();
        if (!company)
            return res.status(404).json({ error: "Company not found" });
        const newSvc = {
            serviceName,
            servicePrice,
            serviceKapora,
            serviceDuration,
        };
        company.services.push(newSvc);
        await company.save();
        // return the last-added subdoc (with its generated _id)
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
        const { serviceId } = req.params;
        const updates = req.body;
        const company = await Company_1.default.findOneAndUpdate({ _id: req.params.companyId, "services._id": serviceId }, {
            $set: Object.entries(updates).reduce((acc, [k, v]) => ({ ...acc, [`services.$.${k}`]: v }), {}),
        }, { new: true }).exec();
        if (!company)
            return res.status(404).json({ error: "Service not found" });
        const svc = company.services.id(serviceId);
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
        const company = await Company_1.default.findById(req.params.companyId).exec();
        if (!company)
            return res.status(404).json({ error: "Company not found" });
        company.services.id(req.params.serviceId)?.remove();
        await company.save();
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteService = deleteService;
