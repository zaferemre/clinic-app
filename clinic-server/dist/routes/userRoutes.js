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
const userCtrl = __importStar(require("../controllers/userController"));
const verifyFirebaseToken_1 = require("../middlewares/verifyFirebaseToken");
const apptCtrl = __importStar(require("../controllers/appointmentController"));
const router = (0, express_1.Router)();
// All /user/* routes require a valid Firebase token
router.use(verifyFirebaseToken_1.verifyFirebaseToken);
// 2) Existing profile endpoints
router.get("/me", userCtrl.getMe);
router.patch("/me", userCtrl.updateMe);
router.post("/register", userCtrl.registerUser); // This is for creating a new user profile if not registered
router.get("/me/companies", userCtrl.listUserCompanies);
router.get("/me/clinics", userCtrl.listUserClinics);
router.delete("/me", userCtrl.deleteUserAccount);
router.post("/membership", userCtrl.addMembership);
// ─── NEW: list my appointments ─────────────────────
router.get("/appointments", apptCtrl.listAppointmentsByUser);
// now GET /user/appointments returns everything with createdBy = my UID
exports.default = router;
