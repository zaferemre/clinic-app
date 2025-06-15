"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findServices = findServices;
exports.addService = addService;
exports.updateService = updateService;
exports.deleteService = deleteService;
const Company_1 = __importDefault(require("../models/Company"));
function findServices(companyId) {
    return Company_1.default.findById(companyId).then((c) => {
        if (!c)
            throw { status: 404, message: "Company not found" };
        return c.services;
    });
}
function addService(companyId, dto) {
    return Company_1.default.findById(companyId).then((c) => {
        if (!c)
            throw { status: 404, message: "Company not found" };
        c.services.push(dto);
        return c.save().then(() => c.services.at(-1));
    });
}
function updateService(companyId, serviceId, updates) {
    return Company_1.default.findById(companyId).then((c) => {
        if (!c)
            throw { status: 404, message: "Company not found" };
        const svc = c.services.id(serviceId);
        if (!svc)
            throw { status: 404, message: "Service not found" };
        Object.assign(svc, updates);
        return c.save().then(() => svc);
    });
}
function deleteService(companyId, serviceId) {
    return Company_1.default.findById(companyId).then((c) => {
        if (!c)
            throw { status: 404, message: "Company not found" };
        const svc = c.services.id(serviceId);
        if (!svc)
            throw { status: 404, message: "Service not found" };
        svc.remove();
        return c.save();
    });
}
