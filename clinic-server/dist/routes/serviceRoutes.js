"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serviceController_1 = require("../controllers/serviceController");
const verifyFirebaseToken_1 = require("../middlewares/verifyFirebaseToken");
const authorizeCompanyAccess_1 = require("../middlewares/authorizeCompanyAccess");
// Note: mergeParams:true is critical so we get companyId & clinicId from the parent
const router = (0, express_1.Router)({ mergeParams: true });
router.use(verifyFirebaseToken_1.verifyFirebaseToken, authorizeCompanyAccess_1.authorizeCompanyAccess);
router.get("/", serviceController_1.listServices);
router.post("/", serviceController_1.createService);
router.patch("/:serviceId", serviceController_1.updateService);
router.delete("/:serviceId", serviceController_1.deleteService);
exports.default = router;
