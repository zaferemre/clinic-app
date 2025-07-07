"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/selfRegisterRoutes.ts
const express_1 = require("express");
const selfRegisterController_1 = require("../controllers/selfRegisterController");
const router = (0, express_1.Router)({ mergeParams: true });
router.post("/:companyId/:clinicId/:token", selfRegisterController_1.selfRegisterPatient);
exports.default = router;
