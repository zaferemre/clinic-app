"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyFirebaseToken_1 = require("../middlewares/verifyFirebaseToken");
const authorizeCompanyAccess_1 = require("../middlewares/authorizeCompanyAccess");
const serviceController_1 = require("../controllers/serviceController");
const router = express_1.default.Router({ mergeParams: true });
// require token + access for any :companyId
router.use("/:companyId", verifyFirebaseToken_1.verifyFirebaseToken, authorizeCompanyAccess_1.authorizeCompanyAccess);
router.get("/:companyId/services", serviceController_1.getServices);
router.post("/:companyId/services", serviceController_1.createService);
router.put("/:companyId/services/:serviceId", serviceController_1.updateService);
router.delete("/:companyId/services/:serviceId", serviceController_1.deleteService);
exports.default = router;
