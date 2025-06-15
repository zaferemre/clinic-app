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
exports.deleteService = exports.updateService = exports.createService = exports.getServices = void 0;
const svcService = __importStar(require("../services/serviceService"));
const getServices = async (req, res, next) => {
    try {
        const list = await svcService.getServices(req.params.companyId);
        res.json(list);
    }
    catch (err) {
        next(err);
    }
};
exports.getServices = getServices;
const createService = async (req, res, next) => {
    try {
        const s = await svcService.createService(req.params.companyId, req.body);
        res.status(201).json(s);
    }
    catch (err) {
        next(err);
    }
};
exports.createService = createService;
const updateService = async (req, res, next) => {
    try {
        const s = await svcService.updateService(req.params.companyId, req.params.serviceId, req.body);
        res.json(s);
    }
    catch (err) {
        next(err);
    }
};
exports.updateService = updateService;
const deleteService = async (req, res, next) => {
    try {
        await svcService.deleteService(req.params.companyId, req.params.serviceId);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.deleteService = deleteService;
