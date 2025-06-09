"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/serviceRoutes.ts
const express_1 = __importDefault(require("express"));
const serviceController_1 = require("../controllers/serviceController");
const router = express_1.default.Router({ mergeParams: true });
router.get("/:companyId/services", serviceController_1.getServices);
router.post("/:companyId/services", serviceController_1.createService);
router.put("/:companyId/services/:serviceId", serviceController_1.updateService);
router.delete("/:companyId/services/:serviceId", serviceController_1.deleteService);
exports.default = router;
