"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyFirebaseToken_1 = require("../middlewares/verifyFirebaseToken");
const authorizeCompanyAccess_1 = require("../middlewares/authorizeCompanyAccess");
const employeeController_1 = require("../controllers/employeeController");
const router = express_1.default.Router();
// require token + access for any :companyId
router.use("/:companyId", verifyFirebaseToken_1.verifyFirebaseToken, authorizeCompanyAccess_1.authorizeCompanyAccess);
router.get("/:companyId/employees", employeeController_1.listEmployees);
router.post("/:companyId/employees", employeeController_1.addEmployee);
exports.default = router;
