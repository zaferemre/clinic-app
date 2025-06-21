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
const express_1 = require("express");
const companyController = __importStar(require("../controllers/companyController"));
const verifyFirebaseToken_1 = require("../middlewares/verifyFirebaseToken");
const authorizeCompanyAccess_1 = require("../middlewares/authorizeCompanyAccess");
const router = (0, express_1.Router)();
// Always require auth for these endpoints
router.use(verifyFirebaseToken_1.verifyFirebaseToken);
// -- Public/entry routes (NO authorizeCompanyAccess here) --
router.post("/join", companyController.joinByCode); // POST /company/join
router.post("/:companyId/clinics/:clinicId/join", companyController.joinClinic); // POST /company/:companyId/clinics/:clinicId/join
// -- Everything after this REQUIRES company membership --
router.use(authorizeCompanyAccess_1.authorizeCompanyAccess);
// Company CRUD
router.post("/", companyController.createCompany);
router.get("/", companyController.listCompanies);
router.get("/:companyId", companyController.getCompanyById);
router.patch("/:companyId", companyController.updateCompany);
router.delete("/:companyId", companyController.deleteCompany);
// Company-level employees
router.get("/:companyId/employees", companyController.listEmployees);
// Leave, delete user
router.post("/:companyId/leave", companyController.leaveCompany);
router.delete("/user", companyController.deleteUserAccount);
exports.default = router;
